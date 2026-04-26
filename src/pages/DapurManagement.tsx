import { useState } from "react";
import { Search, ChefHat, CheckCircle2, XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDapurs } from "@/features/dapur/api";
import { Dapur } from "@/features/dapur/types";
import { formatDateDetail } from "@/lib/date-utils";
import StatsCard from "@/components/shared/StatsCard";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { MoreHorizontal } from "lucide-react";
import CreateDapurDialog from "@/components/dapurs/CreateDapurDialog";
import EditDapurDialog from "@/components/dapurs/EditDapurDialog";
import DeleteDapurDialog from "@/components/dapurs/DeleteDapurDialog";

const DapurManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: dapurs, isLoading } = useGetDapurs();

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const filtered = (dapurs ?? []).filter(
    (d: Dapur) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const totalDapur = dapurs?.length ?? 0;
  const totalActive = dapurs?.filter((d) => d.isActive).length ?? 0;
  const totalInactive = totalDapur - totalActive;

  const statsData = [
    {
      title: "Total Dapur",
      value: isLoading ? undefined : totalDapur,
      icon: <ChefHat className="w-5 h-5 text-primary" />,
      bgIcon: "bg-primary/10",
    },
    {
      title: "Dapur Aktif",
      value: isLoading ? undefined : totalActive,
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      bgIcon: "bg-success/10",
    },
    {
      title: "Dapur Nonaktif",
      value: isLoading ? undefined : totalInactive,
      icon: <XCircle className="w-5 h-5 text-destructive" />,
      bgIcon: "bg-destructive/10",
    },
  ];

  return (
    <DashboardLayout
      title="Kelola Dapur"
      subtitle="Kelola data dapur dalam sistem"
    >
      <div className="grid grid-cols-1 min-[548px]:grid-cols-3 gap-6 mb-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={
              isLoading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                (stat.value ?? 0)
              )
            }
            icon={stat.icon}
            bgIcon={stat.bgIcon}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari dapur..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2 md:w-fit">
          <CreateDapurDialog />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative border-y text-nowrap overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama Dapur</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex w-full h-full flex-col items-center justify-center text-muted-foreground">
                        <ChefHat className="h-8 w-8 mb-2 opacity-50" />
                        <p>Dapur tidak ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((dapur: Dapur, index: number) => (
                    <tr
                      key={dapur.id}
                      className="group border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dapur.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                        {dapur.description || <span className="italic">—</span>}
                      </TableCell>
                      <TableCell>
                        {dapur.isActive ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-muted-foreground/30 text-muted-foreground"
                          >
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateDetail(dapur.createdAt)}
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
                            <EditDapurDialog dapur={dapur} />
                            <DeleteDapurDialog
                              dapurId={dapur.id}
                              dapurName={dapur.name}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-2 pb-2 pt-1">
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalPages={totalPages}
              totalItems={filtered.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handleLimitChange}
            />
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DapurManagement;
