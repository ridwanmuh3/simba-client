import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ImageOff } from "lucide-react";

interface ImageViewerProps {
  src?: string;
}

export default function ImageViewer({ src }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

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
            {hasError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <ImageOff className="w-12 h-12 opacity-50" />
                <p className="text-sm">Gambar tidak tersedia</p>
              </div>
            ) : (
              <img
                src={src}
                alt="Bukti Transaksi"
                className="max-w-full max-h-[80vh] object-contain"
                onError={() => setHasError(true)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
