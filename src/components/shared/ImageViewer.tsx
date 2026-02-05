import { useState } from "react";
import {
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";

const ImageViewer = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Lihat Foto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Bahan</DialogTitle>
          <DialogDescription className="text-sm text-foreground">
            Apakah yakin anda ingin menghapus bahan ini? Data bahan yang dihapus
            tidak dapat dipulihkan.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
