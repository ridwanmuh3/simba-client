import { Calendar, Package, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ItemCombobox from "../ItemCombobox";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MouseEvent, useEffect, useState } from "react";
import {
  useDeleteStockItem,
  useGetAllItemsStocks,
  useGetFullItems,
  useUpdateStockItem,
} from "@/api/items";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AxiosError } from "axios";
import { StockTracking } from "@/types/item";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "../DeleteDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import {
  UpdateItemStockFormInputs,
  updateItemStockSchema,
} from "@/schemas/item/update-item-stock";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateDetail, formatDateTable } from "@/lib/date-utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Spinner from "@/components/shared/Spinner";
import InvoiceDialog from "../InvoiceDialog";

const AddItemStockTab = () => {
  const form = useForm<UpdateItemStockFormInputs>({
    resolver: zodResolver(updateItemStockSchema),
    defaultValues: {
      itemId: "",
      itemName: "",
      itemMeasureUnit: "",
      itemUnitPrice: 0,
      amount: 0,
      supplier: "",
    },
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockTracking | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>();
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>();
  const [errMsg, setErrMsg] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const updateStockItem = useUpdateStockItem();
  const deleteStockItem = useDeleteStockItem();
  const { data: stocksData, isLoading: isStocksLoading } = useGetAllItemsStocks(
    searchQuery,
    page,
    limit,
    dateFrom,
    dateTo,
    "IN",
  );
  const { data: itemsData } = useGetFullItems();
  const filteredStocksTracking = stocksData?.data || [];

  const handleUpdateItemStock = async (values: UpdateItemStockFormInputs) => {
    setErrMsg("");

    if (!values.itemId) {
      setErrMsg("Pilih bahan yang ingin ditambahkan stoknya terlebih dahulu.");
      return;
    }

    if (values.amount <= 0) {
      setErrMsg(
        "Jumlah stok masuk harus lebih dari 0. Masukkan angka yang valid.",
      );
      return;
    }

    try {
      await updateStockItem.mutateAsync({
        type: "IN",
        itemId: values.itemId,
        amount: values.amount,
        supplier: values.supplier,
        unitPrice: values.itemUnitPrice,
      });

      toast({
        title: "Berhasil",
        description: `Stok "${selectedItemId}" berhasil ditambahkan`,
      });

      form.reset();
      setSelectedStock(null);
      setSelectedItemId("");
    } catch (e) {
      const err = e as AxiosError;
      switch (err.status) {
        case 400:
          setErrMsg(
            "Data stok masuk tidak valid. Periksa kembali jumlah dan harga satuan.",
          );
          break;
        case 404:
          setErrMsg(
            "Bahan yang dipilih tidak ditemukan. Muat ulang halaman dan pilih ulang.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menambah stok. Periksa koneksi Anda atau coba lagi.",
          );
      }
    }
  };

  const handleSelectStockTracking = (stockTracking: StockTracking) => {
    setSelectedStock(stockTracking);
    setSelectedItemId(stockTracking.item.id);

    form.setValue("itemId", stockTracking.item.id);
    form.setValue("itemName", stockTracking.item.name);
    form.setValue("amount", 0);
    form.setValue("itemMeasureUnit", stockTracking.item.measureUnit);
    form.setValue("itemUnitPrice", stockTracking.item.unitPrice);
    form.setValue("supplier", "");
  };

  const handleDeleteItemStock = async () => {
    setErrMsg("");
    try {
      await deleteStockItem.mutateAsync({
        id: selectedItemId,
        stockId: selectedStock?.id,
      });
      setSelectedStock(null);
      setSelectedItemId("");
      toast({
        title: "Berhasil menghapus data bahan",
        description: `Anda berhasil menghapus data bahan`,
      });
      setIsEditMode(false);
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 404:
          setErrMsg(
            "Riwayat stok tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.",
          );
          break;
        case 409:
          setErrMsg(
            "Riwayat stok tidak dapat dihapus karena akan membuat stok menjadi negatif.",
          );
          break;
        default:
          setErrMsg(
            "Gagal menghapus riwayat stok. Periksa koneksi Anda atau coba lagi.",
          );
      }
    } finally {
      form.reset();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenFromChange = (open: boolean) => {
    if (open) {
      setTempDateFrom(dateFrom);
    }
    setIsFromOpen(open);
  };

  const handleOpenToChange = (open: boolean) => {
    if (open) {
      setTempDateTo(dateTo);
    }
    setIsToOpen(open);
  };

  const handleConfirmFrom = () => {
    setDateFrom(tempDateFrom);
    setIsFromOpen(false);
  };

  const handleConfirmTo = () => {
    setDateTo(tempDateTo);
    setIsToOpen(false);
  };

  const handleCancelEditStock = (e: MouseEvent) => {
    e.preventDefault();
    setSelectedItemId("");
    setSelectedStock(null);
    form.reset();
    setErrMsg("");
    setIsEditMode(false);
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  return (
    <TabsContent value="bahan-masuk" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Bahan Masuk</CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground">
              Input dengan tanda (*) wajib diisi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="add-item-stock-form"
              className="space-y-4"
              onSubmit={form.handleSubmit(handleUpdateItemStock)}
            >
              <div className="space-y-2">
                <Label>
                  Pilih Bahan<span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="itemId"
                  control={form.control}
                  render={({ field }) => (
                    <ItemCombobox
                      items={itemsData?.data || []}
                      value={field.value}
                      onChange={(val) => {
                        setIsEditMode(false);
                        field.onChange(val);
                        const selectedItm = itemsData?.data?.find(
                          (item) => item.id === val,
                        );
                        if (selectedItm) {
                          handleSelectStockTracking({ item: selectedItm });
                        }
                      }}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Stok<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    {...form.register("amount")}
                    placeholder="1"
                    step="any"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Input
                    value={selectedStock?.item?.measureUnit || "-"}
                    disabled
                  />
                  {form.formState.errors.itemMeasureUnit && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.itemMeasureUnit.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Harga Satuan (Rp)</Label>
                <Input
                  value={formatCurrency(selectedStock?.item?.unitPrice || 0)}
                  disabled
                />
                {form.formState.errors.itemUnitPrice && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.itemUnitPrice.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Total Harga</Label>
                <Input
                  value={formatCurrency(
                    (form.watch("itemUnitPrice") || 0) *
                    (form.watch("amount") || 0),
                  )}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Penyuplai</Label>
                <Input
                  {...form.register("supplier")}
                  placeholder="Nama penyuplai"
                />
                {form.formState.errors.supplier && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.supplier.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-2 flex-wrap-reverse">
                {isEditMode && (
                  <>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      onClick={handleCancelEditStock}
                    >
                      Batal
                    </Button>
                    <DeleteDialog
                      handleDelete={handleDeleteItemStock}
                      isPending={deleteStockItem.isPending}
                      disabledTrigger={!selectedItemId && !selectedStock}
                    />
                  </>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateStockItem.isPending}
                >
                  {updateStockItem.isPending ? (
                    <Spinner color="text-background" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
              {errMsg && (
                <p className="text-sm text-destructive text-center">{errMsg}</p>
              )}
            </form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Riwayat Bahan Masuk</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Popover open={isFromOpen} onOpenChange={handleOpenFromChange}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {dateFrom ? formatDateTable(dateFrom) : "Dari"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={tempDateFrom}
                    onSelect={setTempDateFrom}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                  <div className="flex gap-2 mt-2 mb-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setDateFrom(undefined);
                        setIsFromOpen(false);
                      }}
                    >
                      Batal
                    </Button>
                    <Button className="w-full" onClick={handleConfirmFrom}>
                      Pilih
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover open={isToOpen} onOpenChange={handleOpenToChange}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {dateTo ? formatDateTable(dateTo) : "Sampai"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 px-4 py-2" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={tempDateTo}
                    onSelect={setTempDateTo}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                  <div className="flex gap-2 mt-2 mb-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setDateTo(undefined);
                        setIsToOpen(false);
                      }}
                    >
                      Batal
                    </Button>
                    <Button className="w-full" onClick={handleConfirmTo}>
                      Pilih
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <InvoiceDialog stockType="IN" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative overflow-x-auto border-t text-nowrap">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Tanggal Input</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Perubahan Stok</TableHead>
                    <TableHead>Penyuplai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStocksLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full rounded-md" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredStocksTracking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="flex w-full items-center justify-center">
                          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4">
                            <Package className="h-12 w-12 mb-3 opacity-50" />
                            <p className="text-sm font-medium">
                              {searchQuery
                                ? "Tidak ada hasil pencarian"
                                : "Data masih kosong"}
                            </p>
                            {searchQuery && (
                              <p className="text-xs mt-1 text-muted-foreground/80 max-w-xs">
                                Coba kata kunci lain atau tambah stok bahan
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStocksTracking.map((t) => (
                      <TableRow
                        key={t.id}
                        className={`cursor-pointer transition ${selectedStock?.id === t.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                          }`}
                        onClick={() => {
                          setIsEditMode(true);
                          handleSelectStockTracking(t);
                        }}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {(page - 1) * limit + filteredStocksTracking.indexOf(t) + 1}
                        </TableCell>
                        <TableCell>{formatDateDetail(t.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {t.item?.id}
                        </TableCell>
                        <TableCell>{t.item?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground tabular-nums">
                              {t.previousStock}
                            </span>
                            <span className="text-muted-foreground/40">→</span>
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-inset ring-green-500/20">
                              +{t.newStock - t.previousStock}
                            </span>
                            <span className="text-muted-foreground/40">→</span>
                            <span className="font-semibold tabular-nums">
                              {t.newStock} {t.item?.measureUnit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{t.supplier}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold text-right">
                      Akumulasi Halaman Ini
                    </TableCell>
                    <TableCell className="font-bold">
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600 ring-1 ring-inset ring-green-500/20">
                        +
                        {filteredStocksTracking?.reduce(
                          (acc, curr) => acc + (curr.newStock - curr.previousStock),
                          0,
                        ) || 0}
                      </span>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={stocksData?.paging?.totalPage || 1}
        totalItems={stocksData?.paging?.totalItem || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handleLimitChange}
      />
    </TabsContent>
  );
};

export default AddItemStockTab;
