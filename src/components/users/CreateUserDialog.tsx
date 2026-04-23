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
import { Eye, EyeOff, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  CreateUserFormInputs,
  createUserSchema,
} from "@/features/users/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/features/users/api";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

const CreateUserDialog = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const createUser = useCreateUser();

  const form = useForm<CreateUserFormInputs>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      fullname: "",
      role: "Admin",
      password: "",
    },
  });

  const submitHandler = async (data: CreateUserFormInputs) => {
    setErrorMsg("");
    try {
      const status = await createUser.mutateAsync(data);
      if (status === 201) {
        setIsAddDialogOpen(false);
        toast({
          title: "Berhasil menyimpan pengguna",
          description: `Anda telah menyimpan pengguna dengan nama "${data.fullname}"`,
        });
        form.reset();
      }
    } catch (err: unknown) {
      const e = err as AxiosError;
      switch (e.status) {
        case 400:
          setErrorMsg(
            "Data pengguna tidak valid. Periksa kembali username, nama, dan password Anda.",
          );
          break;
        case 409:
          setErrorMsg(
            "Username sudah digunakan. Silakan pilih username lain.",
          );
          break;
        case 401:
        case 403:
          setErrorMsg(
            "Anda tidak memiliki izin untuk menambah pengguna. Hubungi Super Admin.",
          );
          break;
        default:
          setErrorMsg(
            "Gagal menyimpan pengguna. Periksa koneksi Anda atau coba lagi.",
          );
          break;
      }
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi pengguna yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-user-form"
          onSubmit={form.handleSubmit(submitHandler)}
          className="grid gap-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="fullname">Nama Lengkap</Label>
            <Input
              {...form.register("fullname")}
              id="fullname"
              placeholder="Masukkan nama lengkap"
              disabled={createUser.isPending}
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
              {...form.register("username")}
              id="username"
              placeholder="admin123"
              disabled={createUser.isPending}
              autoComplete="false"
            />
            {form.formState.errors.username && (
              <p className="text-xs text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={form.control}
              rules={{ required: "Role wajib dipilih" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                {...form.register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={createUser.isPending}
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
            onClick={() => setIsAddDialogOpen(false)}
            disabled={createUser.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            disabled={createUser.isPending}
          >
            Simpan
          </Button>
        </DialogFooter>
        {errorMsg && (
          <p className="text-xs text-red-500 text-center">{errorMsg}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
