import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteDapurMutation } from "@/features/dapur/api";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteDapurDialogProps {
  dapurId: number;
  dapurName: string;
}

const DeleteDapurDialog = ({ dapurId, dapurName }: DeleteDapurDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const deleteDapur = useDeleteDapurMutation();

  const deleteHandler = async () => {
    setErrorMsg("");
    try {
      await deleteDapur.mutateAsync({ id: dapurId });
      setOpen(false);
      toast({
        title: "Berhasil menghapus dapur",
        description: `Dapur "${dapurName}" berhasil dihapus.`,
      });
    } catch (err: unknown) {
      const e = err as AxiosError;
      switch (e.status) {
        case 404:
          setErrorMsg("Dapur tidak ditemukan. Mungkin sudah dihapus.");
          break;
        case 403:
          setErrorMsg("Anda tidak memiliki izin untuk menghapus dapur.");
          break;
        default:
          setErrorMsg("Gagal menghapus dapur. Coba lagi.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle>Hapus Dapur</DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            Apakah Anda yakin ingin menghapus dapur ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm-dapur-name">
            Ketik <span className="font-semibold">"{dapurName}"</span> untuk konfirmasi
          </Label>
          <Input
            id="confirm-dapur-name"
            placeholder={dapurName}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>
        {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleteDapur.isPending}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={deleteHandler}
            disabled={deleteDapur.isPending || confirmName !== dapurName}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDapurDialog;
