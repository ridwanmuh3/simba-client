import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Item } from "@/types/item";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const ImportItemDialog = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Item[]>([]);

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Import CSV</DialogTitle>
          <DialogDescription>
            {importPreview.length} bahan akan diimpor. Periksa data sebelum
            konfirmasi.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importPreview.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.measureUnit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsImportDialogOpen(false);
              setImportPreview([]);
            }}
          >
            Batal
          </Button>
          {/* <Button onClick={handleImportConfirm}>
              Import {importPreview.length} Bahan
            </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportItemDialog;
