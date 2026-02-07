import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ImageViewerProps {
  imageUrl?: string;
}

export default function ImageViewer({ imageUrl }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Eye className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="relative w-full h-[600px] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Bukti Transaksi"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.png";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
