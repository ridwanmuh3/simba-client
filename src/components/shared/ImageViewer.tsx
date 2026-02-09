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
  console.log(src);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle>Bukti Foto</DialogTitle>
        <div className="relative w-full h-[600px] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
          <img
            src={src}
            alt="Bukti Transaksi"
            className="max-w-full max-h-full object-contain"
            // onError={(e) => {
            //   const target = e.target as HTMLImageElement;
            //   target.src = "/placeholder-image.png";
            // }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
