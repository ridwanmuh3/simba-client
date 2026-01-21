import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
  Download,
  Upload,
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
import {
  exportToCSV,
  parseCSV,
  downloadCSVTemplate,
  ItemData,
} from "@/lib/csv-utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for transactions
interface StockTransaction {
  id: number;
  date: Date;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  supplier?: string;
  notes?: string;
}

const initialItems: ItemData[] = [
  {
    id: 1,
    code: "BHN-001",
    name: "Beras Premium",
    category: "Karbohidrat",
    stock: 500,
    unit: "kg",
    pricePerUnit: 14000,
    status: "active",
  },
  {
    id: 2,
    code: "BHN-002",
    name: "Ayam Potong",
    category: "Protein",
    stock: 150,
    unit: "kg",
    pricePerUnit: 38000,
    status: "active",
  },
  {
    id: 3,
    code: "BHN-003",
    name: "Telur Ayam",
    category: "Protein",
    stock: 200,
    unit: "kg",
    pricePerUnit: 28000,
    status: "active",
  },
  {
    id: 4,
    code: "BHN-004",
    name: "Tempe",
    category: "Protein",
    stock: 150,
    unit: "bungkus",
    pricePerUnit: 5000,
    status: "active",
  },
  {
    id: 5,
    code: "BHN-005",
    name: "Kangkung",
    category: "Sayuran",
    stock: 80,
    unit: "ikat",
    pricePerUnit: 5000,
    status: "active",
  },
  {
    id: 6,
    code: "BHN-006",
    name: "Wortel",
    category: "Sayuran",
    stock: 45,
    unit: "kg",
    pricePerUnit: 12000,
    status: "active",
  },
  {
    id: 7,
    code: "BHN-007",
    name: "Minyak Goreng",
    category: "Pendukung",
    stock: 100,
    unit: "liter",
    pricePerUnit: 18000,
    status: "active",
  },
  {
    id: 8,
    code: "BHN-008",
    name: "Gula Pasir Curah",
    category: "Pendukung",
    stock: 30,
    unit: "kg",
    pricePerUnit: 17000,
    status: "active",
  },
];

const initialIncomingStock: StockTransaction[] = [
  {
    id: 1,
    date: new Date("2025-10-28"),
    itemCode: "BHN-004",
    itemName: "Tempe",
    unit: "bungkus",
    qty: 150,
    pricePerUnit: 5000,
    supplier: "CV Tempe Jaya",
  },
  {
    id: 2,
    date: new Date("2025-10-27"),
    itemCode: "BHN-008",
    itemName: "Gula Pasir Curah",
    unit: "kg",
    qty: 2,
    pricePerUnit: 17000,
    supplier: "Toko Grosir",
  },
  {
    id: 3,
    date: new Date("2025-10-27"),
    itemCode: "BHN-001",
    itemName: "Beras Premium",
    unit: "kg",
    qty: 1,
    pricePerUnit: 15140,
    supplier: "Toko Beras Makmur",
  },
];

const initialOutgoingStock: StockTransaction[] = [
  {
    id: 1,
    date: new Date("2025-10-28"),
    itemCode: "BHN-001",
    itemName: "Beras Premium",
    unit: "kg",
    qty: 50,
    pricePerUnit: 14000,
    notes: "Menu hari Senin",
  },
  {
    id: 2,
    date: new Date("2025-10-28"),
    itemCode: "BHN-002",
    itemName: "Ayam Potong",
    unit: "kg",
    qty: 20,
    pricePerUnit: 38000,
    notes: "Menu hari Senin",
  },
];

export default function Items() {
  const [activeTab, setActiveTab] = useState("stok-awal");
  const [items, setItems] = useState<ItemData[]>(initialItems);
  const [incomingStock, setIncomingStock] =
    useState<StockTransaction[]>(initialIncomingStock);
  const [outgoingStock, setOutgoingStock] =
    useState<StockTransaction[]>(initialOutgoingStock);

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

  // Selected row
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Import dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<ItemData>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd MMM yyyy", { locale: id });
  };

  const clearForm = () => {
    setFormItemCode("");
    setFormItemName("");
    setFormUnit("");
    setFormQty("");
    setFormPrice("");
    setFormSupplier("");
    setFormCategory("");
    setFormCurrentStock("");
    setFormDate(new Date());
    setSelectedId(null);
  };

  const handleSelectItem = (item: ItemData) => {
    setFormItemCode(item.code);
    setFormItemName(item.name);
    setFormUnit(item.unit);
    setFormPrice(item.pricePerUnit.toString());
    setFormCategory(item.category);
    setFormCurrentStock(item.stock.toString());
    setSelectedId(item.id);
  };

  const handleSelectTransaction = (transaction: StockTransaction) => {
    setFormItemCode(transaction.itemCode);
    setFormItemName(transaction.itemName);
    setFormUnit(transaction.unit);
    setFormQty(transaction.qty.toString());
    setFormPrice(transaction.pricePerUnit.toString());
    setFormSupplier(transaction.supplier || "");
    setFormDate(transaction.date);
    setSelectedId(transaction.id);
  };

  const handleSaveStokAwal = () => {
    if (!formItemName || !formUnit || !formCategory) {
      toast.error("Lengkapi semua field yang diperlukan");
      return;
    }

    if (selectedId) {
      setItems(
        items.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                name: formItemName,
                unit: formUnit,
                pricePerUnit: Number(formPrice) || 0,
                category: formCategory,
                stock: Number(formCurrentStock) || 0,
              }
            : item,
        ),
      );
      toast.success("Data bahan berhasil diperbarui");
    } else {
      const newItem: ItemData = {
        id: items.length + 1,
        code: `BHN-${String(items.length + 1).padStart(3, "0")}`,
        name: formItemName,
        category: formCategory,
        stock: Number(formCurrentStock) || 0,
        unit: formUnit,
        pricePerUnit: Number(formPrice) || 0,
        status: "active",
      };
      setItems([...items, newItem]);
      toast.success("Bahan baru berhasil ditambahkan");
    }
    clearForm();
  };

  const handleSaveBarangMasuk = () => {
    if (!formItemCode || !formQty) {
      toast.error("Pilih bahan dan masukkan jumlah");
      return;
    }

    const newTransaction: StockTransaction = {
      id: incomingStock.length + 1,
      date: formDate,
      itemCode: formItemCode,
      itemName: formItemName,
      unit: formUnit,
      qty: Number(formQty),
      pricePerUnit: Number(formPrice) || 0,
      supplier: formSupplier,
    };
    setIncomingStock([newTransaction, ...incomingStock]);

    // Update stock
    setItems(
      items.map((item) =>
        item.code === formItemCode
          ? { ...item, stock: item.stock + Number(formQty) }
          : item,
      ),
    );

    toast.success("Barang masuk berhasil dicatat");
    clearForm();
  };

  const handleSaveBarangKeluar = () => {
    if (!formItemCode || !formQty) {
      toast.error("Pilih bahan dan masukkan jumlah");
      return;
    }

    const item = items.find((i) => i.code === formItemCode);
    if (item && item.stock < Number(formQty)) {
      toast.error("Stok tidak mencukupi");
      return;
    }

    const newTransaction: StockTransaction = {
      id: outgoingStock.length + 1,
      date: formDate,
      itemCode: formItemCode,
      itemName: formItemName,
      unit: formUnit,
      qty: Number(formQty),
      pricePerUnit: Number(formPrice) || 0,
      notes: formSupplier,
    };
    setOutgoingStock([newTransaction, ...outgoingStock]);

    // Update stock
    setItems(
      items.map((item) =>
        item.code === formItemCode
          ? { ...item, stock: item.stock - Number(formQty) }
          : item,
      ),
    );

    toast.success("Barang keluar berhasil dicatat");
    clearForm();
  };

  const handleDelete = () => {
    if (!selectedId) return;

    if (activeTab === "stok-awal") {
      setItems(items.filter((i) => i.id !== selectedId));
      toast.success("Bahan berhasil dihapus");
    } else if (activeTab === "barang-masuk") {
      setIncomingStock(incomingStock.filter((i) => i.id !== selectedId));
      toast.success("Data barang masuk berhasil dihapus");
    } else if (activeTab === "barang-keluar") {
      setOutgoingStock(outgoingStock.filter((i) => i.id !== selectedId));
      toast.success("Data barang keluar berhasil dihapus");
    }
    clearForm();
  };

  const handleExportCSV = () => {
    exportToCSV(items);
    toast.success("Data berhasil diekspor ke CSV");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Hanya file CSV yang diperbolehkan");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setImportPreview(parsed);
        setIsImportDialogOpen(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal membaca file CSV",
        );
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportConfirm = () => {
    const newItems: ItemData[] = importPreview.map((item, index) => ({
      id: items.length + index + 1,
      code:
        item.code || `BHN-${String(items.length + index + 1).padStart(3, "0")}`,
      name: item.name || "",
      category: item.category || "Pendukung",
      stock: item.stock || 0,
      unit: item.unit || "kg",
      pricePerUnit: item.pricePerUnit || 0,
      status: item.status || "active",
    }));

    setItems([...items, ...newItems]);
    setImportPreview([]);
    setIsImportDialogOpen(false);
    toast.success(`${newItems.length} bahan berhasil diimpor`);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filterTransactions = (transactions: StockTransaction[]) => {
    return transactions.filter((t) => {
      const matchSearch =
        t.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDateFrom = !dateFrom || t.date >= dateFrom;
      const matchDateTo = !dateTo || t.date <= dateTo;
      return matchSearch && matchDateFrom && matchDateTo;
    });
  };

  const tabItems = [
    { value: "stok-awal", label: "Stok Awal", icon: Package },
    { value: "barang-masuk", label: "Barang Masuk", icon: PackagePlus },
    { value: "barang-keluar", label: "Barang Keluar", icon: PackageMinus },
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
        <TabsContent value="stok-awal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Form Section */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Data Bahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kode Bahan</Label>
                  <Input
                    value={formItemCode}
                    disabled
                    placeholder="Auto-generate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Bahan</Label>
                  <Input
                    value={formItemName}
                    onChange={(e) => setFormItemName(e.target.value)}
                    placeholder="Masukkan nama bahan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Karbohidrat">Karbohidrat</SelectItem>
                      <SelectItem value="Protein">Protein</SelectItem>
                      <SelectItem value="Sayuran">Sayuran</SelectItem>
                      <SelectItem value="Pendukung">Pendukung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Select value={formUnit} onValueChange={setFormUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="ikat">Ikat</SelectItem>
                      <SelectItem value="buah">Buah</SelectItem>
                      <SelectItem value="bungkus">Bungkus</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label>Stok Awal</Label>
                  <Input
                    type="number"
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearForm}>
                    <X className="w-4 h-4 mr-1" />
                    Bersih
                  </Button>
                  <Button size="sm" onClick={handleSaveStokAwal}>
                    <Save className="w-4 h-4 mr-1" />
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle className="text-lg">Daftar Bahan</CardTitle>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleExportCSV}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={downloadCSVTemplate}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Download Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari bahan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama Bahan</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-center">Stok</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className={`cursor-pointer ${selectedId === item.id ? "bg-primary/10" : ""}`}
                          onClick={() => handleSelectItem(item)}
                        >
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
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {item.stock} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.pricePerUnit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Barang Masuk Tab */}
        <TabsContent value="barang-masuk" className="space-y-4">
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
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearForm}>
                    <X className="w-4 h-4 mr-1" />
                    Bersih
                  </Button>
                  <Button size="sm" onClick={handleSaveBarangMasuk}>
                    <Save className="w-4 h-4 mr-1" />
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
        </TabsContent>

        {/* Barang Keluar Tab */}
        <TabsContent value="barang-keluar" className="space-y-4">
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
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearForm}>
                    <X className="w-4 h-4 mr-1" />
                    Bersih
                  </Button>
                  <Button size="sm" onClick={handleSaveBarangKeluar}>
                    <Save className="w-4 h-4 mr-1" />
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
        </TabsContent>

        {/* Stok Opname Tab */}
        <TabsContent value="stok-opname" className="space-y-4">
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
        </TabsContent>
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
                      {item.code}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.unit}</TableCell>
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
            <Button onClick={handleImportConfirm}>
              Import {importPreview.length} Bahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
