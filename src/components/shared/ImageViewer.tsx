import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ImageViewerProps {
  src?: string;
}

export default function ImageViewer({ src }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Eye className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Bukti Foto</DialogTitle>
          <div className="w-full max-h-[80vh] flex items-center justify-center bg-muted rounded-lg overflow-auto">
            <img
              src={src}
              alt="Bukti Transaksi"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
