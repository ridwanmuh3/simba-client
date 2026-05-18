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
import { Trash2, Info } from "lucide-react";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteDapurDialogProps {
  dapurId?: number;
  dapurName: string;
}

const DeleteDapurDialog = ({ dapurName }: DeleteDapurDialogProps) => {
  const [open, setOpen] = useState(false);

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
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            Tidak Dapat Menghapus Dapur
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground pt-1">
            Penghapusan dapur <span className="font-semibold">"{dapurName}"</span> tidak dapat dilakukan secara mandiri. Hubungi <span className="font-semibold">administrator sistem</span> untuk melanjutkan proses ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDapurDialog;
