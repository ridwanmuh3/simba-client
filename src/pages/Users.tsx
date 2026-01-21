import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Users2,
  UserCircle,
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetAllUsers, useGetUsersStats } from "@/api/users";
import { formatDateDetail, formatDateRelative } from "@/lib/date-utils";
import { User } from "@/types/user";
import Spinner from "@/components/Spinner";
import StatsCard from "@/components/StatsCard";
import { getInitialsIdentity } from "@/lib/utils";
import AddUserForm from "@/components/users/CreateUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers();
  const { data: usersStats, isLoading: isStatsLoading } = useGetUsersStats();

  const renderStat = (value: number | undefined) => {
    if (isStatsLoading) return <Spinner />;
    return value || 0;
  };

  const filteredUsers =
    usersData?.users?.filter(
      (user: User) =>
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <DashboardLayout
      title="Kelola Pengguna"
      subtitle="Kelola data pengguna dan hak akses sistem"
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-fit">
          <AddUserForm />
        </div>
      </div>
      <div className="grid grid-cols-1 min-[548px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Pengguna"
          value={renderStat(usersStats?.usersTotal)}
          icon={<Users2 className="w-5 h-5 text-primary" />}
          bgIcon="bg-primary/10"
        />
        <StatsCard
          title="Super Admin"
          value={renderStat(usersStats?.usersSuperAdminTotal)}
          icon={<ShieldCheck className="w-5 h-5 text-warning" />}
          bgIcon="bg-warning/10"
        />
        <StatsCard
          title="Admin"
          value={renderStat(usersStats?.usersAdminTotal)}
          icon={<Shield className="w-5 h-5 text-primary" />}
          bgIcon="bg-primary/10"
        />
        <StatsCard
          title="Pengguna Aktif"
          value={renderStat(usersStats?.usersActiveTotal)}
          icon={<Shield className="w-5 h-5 text-success" />}
          bgIcon="bg-success/10"
        />
      </div>
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
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex w-full h-full items-center justify-center gap-2 text-muted-foreground">
                        <Spinner />
                        Memuat data pengguna...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex w-full h-full flex-col items-center justify-center text-muted-foreground">
                        <Users2 className="h-8 w-8 mb-2 opacity-50" />
                        <p>Pengguna tidak ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: User, index: number) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
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
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => e.preventDefault()}
                              >
                                <DeleteUserDialog
                                  userId={user.id}
                                  username={user.username}
                                />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Users;
