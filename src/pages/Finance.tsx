import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllFinancesForReport } from "@/features/finance/api";
import ReportViewer from "@/components/finance/ReportViewer";
import FinanceForm from "@/components/finance/FinanceForm";
import FinanceTable from "@/components/finance/FinanceTable";
import { FinanceData } from "@/features/finance/types";
import { toast } from "@/hooks/use-toast";
import { axiosInstance } from "@/core/http/axios";
import { ApiResponse } from "@/types/response";
import { exportFinanceToCSV } from "@/lib/csv-utils";

export default function Finance() {
  const [selectedFinance, setSelectedFinance] = useState<FinanceData | null>(null);
  const { data: reportTransactions = [] } = useGetAllFinancesForReport();

  const handleExportFinances = async () => {
    try {
      const exportedFinance =
        await axiosInstance.get<ApiResponse<FinanceData[]>>("/finances/export");
      if (exportedFinance.data?.data) {
        exportFinanceToCSV(exportedFinance.data.data);
        toast({
          title: "Export data keuangan berhasil",
          description: "Anda berhasil melakukan export data keuangan",
        });
      }
    } catch {
      toast({
        title: "Export data keuangan gagal",
        description: "Tidak dapat mengunduh data keuangan saat ini. Periksa koneksi Anda dan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout
      title="Kelola Keuangan"
      subtitle="Catat pengeluaran dari nota pembelian bahan MBG"
    >
      <div>
        <Tabs defaultValue="finance" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="finance">Data Keuangan</TabsTrigger>
              <TabsTrigger value="reports">Laporan Keuangan</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full sm:w-fit" variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportFinances}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent className="space-y-4" value="finance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FinanceForm
                selectedFinance={selectedFinance}
                onClearSelection={() => setSelectedFinance(null)}
              />
              <FinanceTable
                selectedFinanceId={selectedFinance?.id ?? null}
                onSelectFinance={setSelectedFinance}
              />
            </div>
          </TabsContent>
          <TabsContent value="reports">
            <ReportViewer transactions={reportTransactions} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
