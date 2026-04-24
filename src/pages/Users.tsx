import { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Users2,
  UserCircle,
  Download,
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetAllUsers, useGetUsersStats } from "@/features/users/api";
import { formatDateDetail, formatDateRelative } from "@/lib/date-utils";
import { User } from "@/features/users/types";
import StatsCard from "@/components/shared/StatsCard";
import { downloadHandler, getInitialsIdentity } from "@/lib/utils";
import AddUserForm from "@/components/users/CreateUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import { useSearchParams } from "react-router";
import EditUserDialog from "@/components/users/EditUserDialog";
import { Skeleton } from "@/components/ui/skeleton";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers(
    page,
    limit,
  );
  const { data: usersStats, isLoading: isStatsLoading } = useGetUsersStats();

  const renderStat = (value: number | undefined) => {
    if (isStatsLoading) return <Skeleton className="h-8 w-24 rounded-md" />;
    return value || 0;
  };

  const downloadUserLetterHandler = async () => {
    downloadHandler("surat-pendaftaran-hak-akses.pdf");
  };

  const filteredUsers =
    usersData?.users?.filter(
      (user: User) =>
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const usersStatsData = [
    {
      title: "Total Pengguna",
      value: usersStats?.usersTotal,
      icon: <Users2 className="w-5 h-5 text-primary" />,
      bgIcon: "bg-primary/10",
    },
    {
      title: "Super Admin",
      value: usersStats?.usersSuperAdminTotal,
      icon: <ShieldCheck className="w-5 h-5 text-warning" />,
      bgIcon: "bg-warning/10",
    },
    {
      title: "Admin",
      value: usersStats?.usersAdminTotal,
      icon: <Shield className="w-5 h-5 text-primary" />,
      bgIcon: "bg-primary/10",
    },
    {
      title: "Pengguna Aktif",
      value: usersStats?.usersActiveTotal,
      icon: <Shield className="w-5 h-5 text-success" />,
      bgIcon: "bg-success/10",
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <DashboardLayout
      title="Kelola Pengguna"
      subtitle="Kelola data pengguna dan hak akses sistem"
    >
      <div className="grid grid-cols-1 min-[548px]:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {usersStatsData.map((stat, index) => (
          <div key={stat.title}>
            <StatsCard
              key={index}
              title={stat.title}
              value={renderStat(stat.value)}
              icon={stat.icon}
              bgIcon={stat.bgIcon}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-6 mb-6 flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card min-w-[200px]"
          />
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-6 w-full">
          <div className="flex flex-1 gap-2 w-full md:w-fit">
            <Button
              className="w-full bg-card"
              variant="outline"
              onClick={downloadUserLetterHandler}
            >
              <Download />
              Unduh Pengajuan Akses
            </Button>
          </div>
          <div className="flex flex-1 gap-2 w-full md:w-fit">
            <AddUserForm />
          </div>
        </div>
      </div>
      <div>
        <Card>
          <CardContent className="p-0">
            <div className="relative border-y text-nowrap overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 7 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex w-full h-full flex-col items-center justify-center text-muted-foreground">
                        <Users2 className="h-8 w-8 mb-2 opacity-50" />
                        <p>Pengguna tidak ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: User, index: number) => (
                    <tr key={user.id} className="group">
                      <TableCell className="font-medium text-muted-foreground">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback
                              className={`text-sm ${
                                user.role === "Super Admin"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {getInitialsIdentity(user.fullname)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullname}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <UserCircle className="w-3 h-3" />
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role === "Super Admin" ? (
                          <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-muted-foreground/30 text-muted-foreground"
                          >
                            Tidak Aktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateRelative(user.lastActive)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          {formatDateDetail(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!user.isActive ? (
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
                              <EditUserDialog user={user} />
                              <DeleteUserDialog
                                userId={user.id}
                                username={user.username}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
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
                totalPages={usersData?.paging.totalPage || 1}
                totalItems={usersData?.paging.totalItem || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handleLimitChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;
