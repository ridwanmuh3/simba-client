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
import { Button } from "../ui/button";
import { Edit, Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditUserFormInputs, editUserSchema } from "@/features/users/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "@/features/users/api";
import { toast } from "@/hooks/use-toast";
import { User } from "@/features/users/types";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { AxiosError } from "axios";

interface EditUserDialogProps {
  user: User;
}

const EditUserDialog = ({ user }: EditUserDialogProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const editUser = useEditUser();
  const form = useForm<EditUserFormInputs>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullname: user.fullname,
      password: "",
    },
  });

  const submitHandler = async (data: EditUserFormInputs) => {
    setErrorMsg("");
    try {
      const status = await editUser.mutateAsync({ id: user.id, ...data });
      if (status === 200) {
        setIsEditDialogOpen(false);
        toast({
          title: "Berhasil mengubah pengguna",
          description: `Anda telah mengubah pengguna dengan username "${user.username}"`,
        });
        form.reset();
      }
    } catch (err: unknown) {
      const e = err as AxiosError;
      let errMsg = "";
      switch (e.status) {
        case 400:
          errMsg =
            "Data tidak valid. Pastikan nama lengkap terisi dan password minimal 6 karakter (atau kosongkan jika tidak ingin mengubah).";
          break;
        case 401:
        case 403:
          errMsg =
            "Anda tidak memiliki izin untuk mengubah pengguna ini.";
          break;
        case 404:
          errMsg =
            "Pengguna tidak ditemukan. Kemungkinan sudah dihapus.";
          break;
        default:
          errMsg =
            "Gagal menyimpan perubahan. Periksa koneksi Anda atau coba lagi.";
          break;
      }
      setErrorMsg(errMsg);
    }
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mengubah Pengguna</DialogTitle>
          <DialogDescription>
            Ubah informasi pengguna yang telah dibuat
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-user-form"
          onSubmit={form.handleSubmit(submitHandler)}
          className="grid gap-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="fullname">Nama Lengkap</Label>
            <Input
              {...form.register("fullname")}
              id="fullname"
              placeholder="Masukkan nama lengkap"
              disabled={editUser.isPending}
              autoComplete="false"
            />
            {form.formState.errors.fullname && (
              <p className="text-xs text-red-500">
                {form.formState.errors.fullname.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="admin123"
              disabled
              autoComplete="false"
              value={user.username}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select defaultValue={user.role} disabled>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                {...form.register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={editUser.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(false)}
            disabled={editUser.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            disabled={editUser.isPending}
          >
            Simpan
          </Button>
        </DialogFooter>
        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
