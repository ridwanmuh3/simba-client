import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Trash2,
  FileText,
  FileDown,
  Package,
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  Calendar,
  Save,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { exportToCSV, parseCSV, downloadCSVTemplate } from "@/lib/csv-utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Item } from "@/types/item";
import MasterItemTab from "@/components/items/MasterItemTab";
import { formatDateTable } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils";

// Types for transactions
interface StockTransaction {
  id: "number";
  date: Date;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  supplier?: string;
  notes?: string;
}

const initialItems: Item[] = [
  {
    id: "1",
    name: "Beras Premium",
    category: "Karbohidrat",
    stock: 500,
    measureUnit: "kg",
    pricePerUnit: 14000,
  },
  {
    id: "2",
    name: "Ayam Potong",
    category: "Protein",
    stock: 150,
    measureUnit: "kg",
    pricePerUnit: 38000,
  },
  {
    id: "3",
    name: "Telur Ayam",
    category: "Protein",
    stock: 200,
    measureUnit: "kg",
    pricePerUnit: 28000,
  },
  {
    id: "4",
    name: "Tempe",
    category: "Protein",
    stock: 150,
    measureUnit: "bungkus",
    pricePerUnit: 5000,
  },
  {
    id: "5",
    name: "Kangkung",
    category: "Sayuran",
    stock: 80,
    measureUnit: "ikat",
    pricePerUnit: 5000,
  },
  {
    id: "6",
    name: "Wortel",
    category: "Sayuran",
    stock: 45,
    measureUnit: "kg",
    pricePerUnit: 12000,
  },
  {
    id: "7",
    name: "Minyak Goreng",
    category: "Pendukung",
    stock: 100,
    measureUnit: "liter",
    pricePerUnit: 18000,
  },
  {
    id: "8",
    name: "Gula Pasir Curah",
    category: "Pendukung",
    stock: 30,
    measureUnit: "kg",
    pricePerUnit: 17000,
  },
];

// const initialIncomingStock: StockTransaction[] = [
//   {
//     id: "1",
//     date: new Date("2025-10-28"),
//     itemCode: "BHN-004",
//     itemName: "Tempe",
//     measureUnit: "bungkus",
//     qty: 150,
//     supplier: "CV Tempe Jaya",
//   },
//   {
//     id: "2",
//     date: new Date("2025-10-27"),
//     itemCode: "BHN-008",
//     itemName: "Gula Pasir Curah",
//     measureUnit: "kg",
//     qty: 2,
//     supplier: "Toko Grosir",
//   },
//   {
//     id: "3",
//     date: new Date("2025-10-27"),
//     itemCode: "BHN-001",
//     itemName: "Beras Premium",
//     measureUnit: "kg",
//     qty: 1,
//     supplier: "Toko Beras Makmur",
//   },
// ];

// const initialOutgoingStock: StockTransaction[] = [
//   {
//     id: "1",
//     date: new Date("2025-10-28"),
//     itemCode: "BHN-001",
//     itemName: "Beras Premium",
//     measureUnit: "kg",
//     qty: 50,
//     notes: "Menu hari Senin",
//   },
//   {
//     id: "2",
//     date: new Date("2025-10-28"),
//     itemCode: "BHN-002",
//     itemName: "Ayam Potong",
//     measureUnit: "kg",
//     qty: 20,
//     notes: "Menu hari Senin",
//   },
// ];

const Items = () => {
  const [activeTab, setActiveTab] = useState("data-bahan");
  const [items, setItems] = useState<Item[]>(initialItems);
  // const [incomingStock, setIncomingStock] =
  //   useState<StockTransaction[]>(initialIncomingStock);
  // const [outgoingStock, setOutgoingStock] =
  //   useState<StockTransaction[]>(initialOutgoingStock);

  // Form states
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formItemCode, setFormItemCode] = useState("");
  const [formItemName, setFormItemName] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formCurrentStock, setFormCurrentStock] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Item>[]>([]);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const clearForm = () => {
  //   setFormItemCode("");
  //   setFormItemName("");
  //   setFormUnit("");
  //   setFormQty("");
  //   setFormPrice("");
  //   setFormSupplier("");
  //   setFormCategory("");
  //   setFormCurrentStock("");
  //   setFormDate(new Date());
  //   setSelectedId(null);
  // };

  // const handleSelectItem = (item: Item) => {
  //   setFormItemCode(item.code);
  //   setFormItemName(item.name);
  //   setFormUnit(item.unit);
  //   setFormPrice(item.pricePerUnit.toString());
  //   setFormCategory(item.category);
  //   setFormCurrentStock(item.stock.toString());
  //   setSelectedId(item.id);
  // };

  // const handleSelectTransaction = (transaction: StockTransaction) => {
  //   setFormItemCode(transaction.itemCode);
  //   setFormItemName(transaction.itemName);
  //   setFormUnit(transaction.unit);
  //   setFormQty(transaction.qty.toString());
  //   setFormPrice(transaction.pricePerUnit.toString());
  //   setFormSupplier(transaction.supplier || "");
  //   setFormDate(transaction.date);
  //   setSelectedId(transaction.id);
  // };

  const handleSaveBarangMasuk = () => {
    if (!formItemCode || !formQty) {
      toast.error("Pilih bahan dan masukkan jumlah");
      return;
    }

    // const newTransaction: StockTransaction = {
    //   id: "incomingStock".length + 1,
    //   date: formDate,
    //   itemCode: formItemCode,
    //   itemName: formItemName,
    //   unit: formUnit,
    //   qty: Number(formQty),
    //   pricePerUnit: Number(formPrice) || 0,
    //   supplier: formSupplier,
  };
  // setIncomingStock([newTransaction, ...incomingStock]);

  const tabItems = [
    { value: "data-bahan", label: "Data bahan", icon: Package },
    { value: "bahan-masuk", label: "Bahan Masuk", icon: PackagePlus },
    { value: "bahan-keluar", label: "Bahan Keluar", icon: PackageMinus },
    { value: "stok-opname", label: "Stok Opname", icon: ClipboardCheck },
  ];

  return (
    <DashboardLayout
      title="Kelola Bahan MBG"
      subtitle="Inventarisasi bahan makanan untuk program Makan Bergizi Gratis"
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Stok Awal Tab */}
        <MasterItemTab />
        {/* Barang Masuk Tab */}
        {/* <TabsContent value="barang-masuk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Input Barang Masuk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(formDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formDate}
                        onSelect={(date) => date && setFormDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Pilih Bahan</Label>
                  <Select
                    value={formItemCode}
                    onValueChange={(code) => {
                      const item = items.find((i) => i.code === code);
                      if (item) {
                        setFormItemCode(code);
                        setFormItemName(item.name);
                        setFormUnit(item.unit);
                        setFormPrice(item.pricePerUnit.toString());
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.code} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Satuan</Label>
                    <Input value={formUnit} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Harga Satuan (Rp)</Label>
                  <Input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Harga</Label>
                  <Input
                    value={formatCurrency(
                      (Number(formQty) || 0) * (Number(formPrice) || 0),
                    )}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Penyuplai</Label>
                  <Input
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Nama penyuplai"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="w-full"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </Button>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleSaveStokAwal}
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Riwayat Barang Masuk</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dateFrom ? formatDate(dateFrom) : "Dari"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dateTo ? formatDate(dateTo) : "Sampai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama Bahan</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterTransactions(incomingStock).map((t, index) => (
                        <TableRow
                          key={t.id}
                          className={`cursor-pointer ${selectedId === t.id ? "bg-primary/10" : ""}`}
                          onClick={() => handleSelectTransaction(t)}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {t.itemCode}
                          </TableCell>
                          <TableCell>{t.itemName}</TableCell>
                          <TableCell>{t.unit}</TableCell>
                          <TableCell className="text-center">{t.qty}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(t.pricePerUnit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}
        {/* <TabsContent value="barang-keluar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Input Barang Keluar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDateTable(formDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formDate}
                        onSelect={(date) => date && setFormDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Pilih Bahan</Label>
                  <Select
                    value={formItemCode}
                    onValueChange={(code) => {
                      const item = items.find((i) => i.code === code);
                      if (item) {
                        setFormItemCode(code);
                        setFormItemName(item.name);
                        setFormUnit(item.unit);
                        setFormPrice(item.pricePerUnit.toString());
                        setFormCurrentStock(item.stock.toString());
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.code} - {item.name} (Stok: {item.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Sisa Stok</Label>
                    <Input value={formCurrentStock} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty Keluar</Label>
                    <Input
                      type="number"
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Input value={formUnit} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Keterangan</Label>
                  <Input
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Misal: Menu hari Senin"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="w-full"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </Button>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleSaveStokAwal}
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Riwayat Barang Keluar</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dateFrom ? formatDate(dateFrom) : "Dari"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dateTo ? formatDate(dateTo) : "Sampai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama Bahan</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterTransactions(outgoingStock).map((t, index) => (
                        <TableRow
                          key={t.id}
                          className={`cursor-pointer ${selectedId === t.id ? "bg-primary/10" : ""}`}
                          onClick={() => handleSelectTransaction(t)}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {t.itemCode}
                          </TableCell>
                          <TableCell>{t.itemName}</TableCell>
                          <TableCell>{t.unit}</TableCell>
                          <TableCell className="text-center">{t.qty}</TableCell>
                          <TableCell>{t.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}
        {/* <TabsContent value="stok-opname" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Stok Opname - Rekap Inventaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari bahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 max-w-sm"
                />
              </div>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Bahan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-center">
                        Stok Saat Ini
                      </TableHead>
                      <TableHead className="text-center">Total Masuk</TableHead>
                      <TableHead className="text-center">
                        Total Keluar
                      </TableHead>
                      <TableHead className="text-right">Nilai Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, index) => {
                      const totalIn = incomingStock
                        .filter((t) => t.itemCode === item.code)
                        .reduce((sum, t) => sum + t.qty, 0);
                      const totalOut = outgoingStock
                        .filter((t) => t.itemCode === item.code)
                        .reduce((sum, t) => sum + t.qty, 0);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={
                                item.stock < 20
                                  ? "text-destructive font-bold"
                                  : "font-medium"
                              }
                            >
                              {item.stock} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            +{totalIn}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            -{totalOut}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.stock * item.pricePerUnit)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Total Nilai Inventaris
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      items.reduce(
                        (sum, item) => sum + item.stock * item.pricePerUnit,
                        0,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* Import Dialog */}
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
                    <TableCell className="font-mono text-sm">
                      {item.id}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.measureUnit}</TableCell>
                    <TableCell>
                      {formatCurrency(item.pricePerUnit || 0)}
                    </TableCell>
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
    </DashboardLayout>
  );
};

export default Items;
