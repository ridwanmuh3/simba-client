import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Eye,
  FileSpreadsheet,
  FileText,
  FileDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { exportToCSV, parseCSV, downloadCSVTemplate, ItemData } from "@/lib/csv-utils";

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
    stock: 0,
    unit: "kg",
    pricePerUnit: 18000,
    status: "locked",
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
    name: "Gula Pasir",
    category: "Pendukung",
    stock: 30,
    unit: "kg",
    pricePerUnit: 16000,
    status: "active",
  },
];

export default function Items() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [items, setItems] = useState<ItemData[]>(initialItems);
  const [importPreview, setImportPreview] = useState<Partial<ItemData>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    exportToCSV(items);
    toast.success("Data berhasil diekspor ke CSV");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
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
        toast.error(error instanceof Error ? error.message : "Gagal membaca file CSV");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = () => {
    const newItems: ItemData[] = importPreview.map((item, index) => ({
      id: items.length + index + 1,
      code: item.code || `BHN-${String(items.length + index + 1).padStart(3, '0')}`,
      name: item.name || '',
      category: item.category || 'Pendukung',
      stock: item.stock || 0,
      unit: item.unit || 'kg',
      pricePerUnit: item.pricePerUnit || 0,
      status: item.status || 'active',
    }));

    setItems([...items, ...newItems]);
    setImportPreview([]);
    setIsImportDialogOpen(false);
    toast.success(`${newItems.length} bahan berhasil diimpor`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <DashboardLayout
      title="Kelola Bahan MBG"
      subtitle="Inventarisasi bahan makanan untuk program Makan Bergizi Gratis"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari bahan makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Semua Kategori</DropdownMenuItem>
              <DropdownMenuItem>Karbohidrat</DropdownMenuItem>
              <DropdownMenuItem>Protein</DropdownMenuItem>
              <DropdownMenuItem>Sayuran</DropdownMenuItem>
              <DropdownMenuItem>Pendukung</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
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

          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bahan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Bahan Makanan</DialogTitle>
                <DialogDescription>
                  Masukkan informasi bahan untuk inventaris MBG
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Bahan</Label>
                  <Input id="name" placeholder="Masukkan nama bahan" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="karbohidrat">Karbohidrat</SelectItem>
                        <SelectItem value="protein">Protein</SelectItem>
                        <SelectItem value="sayuran">Sayuran</SelectItem>
                        <SelectItem value="pendukung">Pendukung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Satuan</Label>
                    <Select>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok Awal</Label>
                    <Input id="stock" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga per Satuan</Label>
                    <Input id="price" type="number" placeholder="0" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Preview Import CSV</DialogTitle>
                <DialogDescription>
                  {importPreview.length} bahan akan diimpor. Periksa data sebelum konfirmasi.
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
                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.pricePerUnit || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportPreview([]);
                }}>
                  Batal
                </Button>
                <Button onClick={handleImportConfirm}>
                  Import {importPreview.length} Bahan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-right">Harga/Satuan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell className="font-mono text-sm">
                      {item.code}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${
                          item.stock === 0
                            ? "text-destructive"
                            : item.stock < 20
                            ? "text-warning"
                            : "text-foreground"
                        }`}
                      >
                        {item.stock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.pricePerUnit)}/{item.unit}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === "locked" ? (
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/30"
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Terkunci
                        </Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
                          Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="w-4 h-4 mr-2" />
                            Kunci Data
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>Menampilkan 1-{items.length} dari {items.length} bahan</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" disabled>
            Selanjutnya
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
