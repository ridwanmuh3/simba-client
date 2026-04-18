import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteUser } from "@/api/users";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { DropdownMenuItem } from "../ui/dropdown-menu";

interface DeleteUserDialogProps {
  userId: number;
  username: string;
}

const DeleteUserDialog = ({ userId, username }: DeleteUserDialogProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteUser = useDeleteUser();
  const [errorMsg, setErrorMsg] = useState("");
  const [deletedUsername, setDeletedUsername] = useState("");

  const deleteUserHandler = async () => {
    setErrorMsg("");
    try {
      await deleteUser.mutateAsync({ id: userId });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Berhasil menghapus pengguna",
        description: `Anda berhasil menghapus pengguna dengan username "${username}".`,
      });
    } catch (err: unknown) {
      const { status } = err as AxiosError;
      let errMsg = "";
      switch (status) {
        case 400:
          errMsg =
            "Anda tidak dapat menghapus akun Anda sendiri. Minta admin lain untuk melakukannya.";
          break;
        case 401:
          errMsg =
            "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";
          break;
        case 403:
          errMsg =
            "Tidak dapat menghapus Super Admin terakhir. Sistem harus memiliki minimal satu Super Admin.";
          break;
        case 404:
          errMsg =
            "Pengguna tidak ditemukan. Kemungkinan sudah dihapus sebelumnya.";
          break;
        default:
          errMsg =
            "Gagal menghapus pengguna. Periksa koneksi Anda atau coba lagi.";
      }
      setErrorMsg(errMsg);
    }
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Pengguna</DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            Apakah yakin anda ingin menghapus akun ini? Akun pengguna yang
            dihapus tidak dapat dipulihkan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-sm text-foreground" htmlFor="deleted-username">
            Untuk konfirmasi, silahkan ketik "{username}" di dalam kotak
          </Label>
          <Input
            id="deleted-username"
            placeholder={username}
            onChange={(e) => setDeletedUsername(e.target.value)}
          />
        </div>
        {errorMsg && (
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={deleteUser.isPending}
          >
            Batal
          </Button>
          <Button
            disabled={deleteUser.isPending || username !== deletedUsername}
            variant="destructive"
            onClick={deleteUserHandler}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
