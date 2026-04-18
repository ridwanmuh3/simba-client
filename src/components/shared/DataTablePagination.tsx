import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const DataTablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) => {
  const effectiveTotalPages = totalPages > 0 ? totalPages : 1;

  useEffect(() => {
    if (totalItems === 0) {
      if (currentPage !== 1) onPageChange(1);
      return;
    }
    if (currentPage > effectiveTotalPages) {
      onPageChange(effectiveTotalPages);
    } else if (currentPage < 1) {
      onPageChange(1);
    }
  }, [currentPage, effectiveTotalPages, totalItems, onPageChange]);

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= effectiveTotalPages;

  return (
    <div className="flex flex-col gap-2 px-2 py-2 w-full md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground order-2 md:order-1 md:flex-1">
        {totalItems > 0 ? (
          <span>
            Menampilkan {(currentPage - 1) * pageSize + 1} sampai{" "}
            {Math.min(currentPage * pageSize, totalItems)} dari {totalItems}{" "}
            data
          </span>
        ) : (
          "Data tidak ada"
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-4 order-1 md:order-2 lg:gap-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Data per Halaman</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 15, 20].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={isFirst}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirst}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLast}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(effectiveTotalPages)}
            disabled={isLast}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto flex min-w-[120px] items-center justify-end text-sm font-medium">
          Halaman {currentPage} dari {effectiveTotalPages}
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
