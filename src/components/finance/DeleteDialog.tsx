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
import { DialogDescription } from "@radix-ui/react-dialog";

interface DeleteDialogProps {
  isPending: boolean;
  disabledTrigger?: boolean;
  handleDelete: () => Promise<void>;
}

const DeleteDialog = ({
  isPending,
  handleDelete,
  disabledTrigger = false,
}: DeleteDialogProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteItemButtonHandler = async () => {
    try {
      await handleDelete();
      setIsDeleteDialogOpen(false);
    } catch (_err) {
      /* error handled by caller's mutation onError */
    }
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="w-full"
          disabled={disabledTrigger}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Data Keuangan</DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            Apakah yakin anda ingin menghapus data keuangan ini? Data data
            keuangan yang dihapus tidak dapat dipulihkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={deleteItemButtonHandler}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
