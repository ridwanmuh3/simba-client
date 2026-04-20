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
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 min-[548px]:grid-cols-3 lg:w-auto lg:inline-flex">
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
          <StockOpnameTab />
          <InvoiceHistoryTab />
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Items;
