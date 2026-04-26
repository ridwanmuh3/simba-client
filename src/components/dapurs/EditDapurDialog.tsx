import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editDapurSchema, EditDapurFormInputs } from "@/features/dapur/schemas";
import { useUpdateDapurMutation } from "@/features/dapur/api";
import { Dapur } from "@/features/dapur/types";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EditDapurDialogProps {
  dapur: Dapur;
}

const EditDapurDialog = ({ dapur }: EditDapurDialogProps) => {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const updateDapur = useUpdateDapurMutation();

  const form = useForm<EditDapurFormInputs>({
    resolver: zodResolver(editDapurSchema),
    defaultValues: {
      name: dapur.name,
      description: dapur.description ?? "",
      isActive: dapur.isActive,
    },
  });

  const submitHandler = async (data: EditDapurFormInputs) => {
    setErrorMsg("");
    try {
      await updateDapur.mutateAsync({ id: dapur.id, ...data });
      setOpen(false);
      toast({
        title: "Berhasil mengubah dapur",
        description: `Dapur "${data.name}" berhasil diperbarui.`,
      });
    } catch (err: unknown) {
      const e = err as AxiosError;
      switch (e.status) {
        case 404:
          setErrorMsg("Dapur tidak ditemukan.");
          break;
        case 403:
          setErrorMsg("Anda tidak memiliki izin untuk mengubah dapur.");
          break;
        default:
          setErrorMsg("Gagal menyimpan perubahan. Coba lagi.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Dapur</DialogTitle>
          <DialogDescription>Ubah informasi dapur</DialogDescription>
        </DialogHeader>
        <form
          id="edit-dapur-form"
          onSubmit={form.handleSubmit(submitHandler)}
          className="grid gap-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Dapur</Label>
            <Input
              {...form.register("name")}
              id="edit-name"
              placeholder="Nama dapur"
              disabled={updateDapur.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              {...form.register("description")}
              id="edit-description"
              placeholder="Deskripsi singkat dapur"
              disabled={updateDapur.isPending}
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="edit-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={updateDapur.isPending}
                />
              )}
            />
            <Label htmlFor="edit-is-active">Dapur Aktif</Label>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={updateDapur.isPending}>
            Batal
          </Button>
          <Button type="submit" form="edit-dapur-form" disabled={updateDapur.isPending}>
            Simpan
          </Button>
        </DialogFooter>
        {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default EditDapurDialog;
