import { describe, expect, test } from "bun:test";
import { createXlsxBlob, type XlsxSheet } from "./xlsx-utils";

// Minimal ZIP reader for stored (uncompressed) entries produced by buildZip.
const readZip = async (blob: Blob): Promise<Map<string, string>> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const decoder = new TextDecoder();

  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("end of central directory not found");

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries = new Map<string, string>();

  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error(`bad central header at entry ${i}`);
    }
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLen));

    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const size = view.getUint32(localOffset + 18, true);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;

    entries.set(
      name,
      decoder.decode(bytes.slice(dataStart, dataStart + size)),
    );
    offset += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
};

const simpleSheet = (name: string, values: (string | number)[] = ["a"]): XlsxSheet => ({
  name,
  rows: values.map((value) => ({
    cells: [{ value, type: typeof value === "number" ? "number" : "string" }],
  })),
});

describe("createXlsxBlob", () => {
  test("produces the required OOXML parts", async () => {
    const blob = createXlsxBlob([simpleSheet("Sheet1")]);
    const entries = await readZip(blob);

    expect([...entries.keys()].sort()).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/workbook.xml",
      "xl/worksheets/sheet1.xml",
    ]);
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  test("escapes XML special characters in string cells", async () => {
    const payload = `Tom & "Jerry" <b>it's</b>`;
    const entries = await readZip(
      createXlsxBlob([simpleSheet("Sheet1", [payload])]),
    );
    const sheet = entries.get("xl/worksheets/sheet1.xml") ?? "";

    expect(sheet).toContain(
      "Tom &amp; &quot;Jerry&quot; &lt;b&gt;it&apos;s&lt;/b&gt;",
    );
    expect(sheet).not.toContain("<b>");
  });

  test("writes numeric cells as raw numbers", async () => {
    const entries = await readZip(
      createXlsxBlob([simpleSheet("Sheet1", [42])]),
    );
    const sheet = entries.get("xl/worksheets/sheet1.xml") ?? "";

    expect(sheet).toContain("<v>42</v>");
    expect(sheet).not.toContain("inlineStr");
  });

  test("sanitizes characters Excel rejects in sheet names", async () => {
    const entries = await readZip(
      createXlsxBlob([simpleSheet("a[b]c/d\\e?f*g:h")]),
    );
    const workbook = entries.get("xl/workbook.xml") ?? "";

    expect(workbook).toContain('name="a b c d e f g h"');
  });

  test("truncates sheet names to 31 characters", async () => {
    const entries = await readZip(
      createXlsxBlob([simpleSheet("x".repeat(40))]),
    );
    const workbook = entries.get("xl/workbook.xml") ?? "";

    expect(workbook).toContain(`name="${"x".repeat(31)}"`);
  });

  test("deduplicates sheet names so the workbook stays valid", async () => {
    const entries = await readZip(
      createXlsxBlob([simpleSheet("Data"), simpleSheet("Data")]),
    );
    const workbook = entries.get("xl/workbook.xml") ?? "";
    const names = [...workbook.matchAll(/name="([^"]*)"/g)].map((m) => m[1]);

    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(2);
  });

  test("emits merges and a freeze pane when configured", async () => {
    const sheet: XlsxSheet = {
      name: "Laporan",
      rows: [{ cells: [{ value: "Judul" }] }],
      merges: [{ from: "A1", to: "C1" }],
      freezePane: "A4",
    };
    const entries = await readZip(createXlsxBlob([sheet]));
    const xml = entries.get("xl/worksheets/sheet1.xml") ?? "";

    expect(xml).toContain('<mergeCells count="1"><mergeCell ref="A1:C1"/></mergeCells>');
    expect(xml).toContain('state="frozen"');
    expect(xml).toContain('topLeftCell="A4"');
  });
});
