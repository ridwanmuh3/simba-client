import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Package,
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import MasterItemTab from "@/components/items/tabs/MasterItemTab";
import AddItemStockTab from "@/components/items/tabs/AddItemStockTab";
import ReduceItemStockTab from "@/components/items/tabs/ReduceItemStockTab";

const Items = () => {
  const [activeTab, setActiveTab] = useState("data-bahan");
  const [formItemCode, setFormItemCode] = useState("");
  const [formQty, setFormQty] = useState("");

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
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <MasterItemTab />
        <AddItemStockTab />
        <ReduceItemStockTab />
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
    </DashboardLayout>
  );
};

export default Items;
