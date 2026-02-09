import { Calendar, Package, Save, Search, Upload } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { TabsContent } from "../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  useDeleteStockItem,
  useGetAllItemsStocks,
  useGetFullItems,
  useUpdateStockItem,
} from "@/api/items";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import { Skeleton } from "../../ui/skeleton";
import { AxiosError } from "axios";
import { StockTracking } from "@/types/item";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "../DeleteDialog";
import { useSearchParams } from "react-router";
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

const ReduceItemStockTab = () => {
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
    "OUT",
  );
  console.log(stocksData);
  const { data: itemsData } = useGetFullItems();
  const handleUpdateItemStock = async (values: UpdateItemStockFormInputs) => {
    setErrMsg("");

    if (!selectedStock) {
      setErrMsg("Pilih bahan terlebih dahulu");
      return;
    }

    if (values.amount <= 0) {
      setErrMsg("Jumlah stok keluar harus lebih dari 0");
      return;
    }

    if (values.amount > selectedStock.item.stock) {
      setErrMsg("Stok tidak mencukupi");
      return;
    }

    try {
      await updateStockItem.mutateAsync({
        type: "OUT",
        itemId: values.itemId,
        amount: values.amount,
        unitPrice: values.itemUnitPrice,
      });

      toast({
        title: "Berhasil",
        description: `Stok "${selectedItemId}" berhasil dikurangi`,
      });

      form.reset();
      setSelectedStock(null);
      setSelectedItemId("");
    } catch {
      setErrMsg("Terjadi kesalahan server");
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
  };

  const handleDeleteItemStock = async () => {
    setErrMsg("");
    try {
      const response = await deleteStockItem.mutateAsync({
        id: selectedItemId,
        stockId: selectedStock?.id,
      });
      if (response.status === 200) {
        setSelectedStock(null);
        setSelectedItemId("");
        toast({
          title: "Berhasil menghapus data bahan",
          description: `Anda berhasil menghapus data bahan`,
        });
      }
    } catch (e: unknown) {
      const err = e as AxiosError;
      switch (err.status) {
        case 400:
          setErrMsg("Terjadi kesalahan input data bahan");
          break;
        case 404:
          setErrMsg("Data tidak ditemukan");
        default:
          setErrMsg("Terjadi kesalahan server");
          break;
      }
    } finally {
      form.reset();
    }
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <TabsContent value="bahan-keluar" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Bahan Keluar</CardTitle>
            <p className="text-sm font-bold text-muted-foreground">
              Input dengan tanda (*) wajib diisi.
            </p>
          </CardHeader>
          <CardContent>
            <form
              id="reduce-item-stock-form"
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
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const selectedItm = itemsData?.data?.find(
                          (item) => item.id === val,
                        );

                        if (selectedItm) {
                          setSelectedItemId(selectedItm.id);
                          handleSelectStockTracking({ item: selectedItm });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bahan" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemsData?.data?.map((t) => (
                          <SelectItem key={t?.id} value={t?.id}>
                            {t?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <Label>
                  Harga Satuan (Rp)<span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="itemUnitPrice"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      value={formatCurrency(field.value)}
                      onChange={(e) => {
                        const raw = parseCurrency(e.target.value);
                        field.onChange(raw);
                      }}
                    />
                  )}
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
              <div className="flex gap-4 pt-2 flex-wrap-reverse">
                <DeleteDialog
                  handleDelete={handleDeleteItemStock}
                  isPending={deleteStockItem.isPending}
                  disabledTrigger={!selectedItemId && !selectedStock}
                />
                <Button
                  type="submit"
                  form="reduce-item-stock-form"
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
            <CardTitle className="text-lg">Riwayat Bahan Keluar</CardTitle>
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative max-h-[500px] overflow-auto border-t text-nowrap">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Stok Sebelumnya</TableHead>
                    <TableHead>Stok Kurang</TableHead>
                    <TableHead>Stok Baru</TableHead>
                    <TableHead>Harga Satuan</TableHead>
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
                  ) : stocksData.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="flex min-h-[400px] w-full items-center justify-center">
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
                    stocksData.data?.map((t, index) => (
                      <TableRow
                        key={t.id}
                        className={`cursor-pointer transition ${
                          selectedStock?.id === t.id
                            ? "bg-muted"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectStockTracking(t)}
                      >
                        <TableCell>{formatDateDetail(t.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {t.item?.id}
                        </TableCell>
                        <TableCell>{t.item?.name}</TableCell>
                        <TableCell>
                          {t.previousStock} {t.item?.measureUnit}
                        </TableCell>
                        <TableCell className="text-red-500">
                          -{t.previousStock - t.newStock}
                        </TableCell>
                        <TableCell
                          className={`${index === 0 ? "font-bold" : ""}`}
                        >
                          {t.newStock} {t.item?.measureUnit}
                        </TableCell>
                        <TableCell>{formatCurrency(t.unitPrice)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
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

export default ReduceItemStockTab;
