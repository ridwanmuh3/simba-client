import { useState } from "react";
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

const mockItems = [
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
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Format Nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

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
                {mockItems.map((item, index) => (
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
        <span>Menampilkan 1-{mockItems.length} dari {mockItems.length} bahan</span>
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
