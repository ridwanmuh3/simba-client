import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Package,
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  ReceiptText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MasterItemTab from "@/components/items/tabs/MasterItemTab";
import AddItemStockTab from "@/components/items/tabs/AddItemStockTab";
import ReduceItemStockTab from "@/components/items/tabs/ReduceItemStockTab";
import StockOpnameTab from "@/components/items/tabs/StockOpnameTab";
import InvoiceHistoryTab from "@/components/items/tabs/InvoiceHistoryTab";

const Items = () => {
  const [activeTab, setActiveTab] = useState("data-bahan");

  const tabItems = [
    { value: "data-bahan", label: "Data Bahan", icon: Package },
    { value: "bahan-masuk", label: "Bahan Masuk", icon: PackagePlus },
    { value: "bahan-keluar", label: "Bahan Keluar", icon: PackageMinus },
    { value: "stok-opname", label: "Stok Opname", icon: ClipboardCheck },
    { value: "riwayat-invoice", label: "Riwayat Invoice", icon: ReceiptText },
  ];

  return (
    <DashboardLayout
      title="Kelola Bahan MBG"
      subtitle="Inventarisasi bahan makanan untuk program Makan Bergizi Gratis"
    >
      <div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max">
              {tabItems.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <MasterItemTab />
          <AddItemStockTab />
          <ReduceItemStockTab />
          <StockOpnameTab />
          <InvoiceHistoryTab />
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Items;
