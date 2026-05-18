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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDapurSchema, CreateDapurFormInputs } from "@/features/dapur/schemas";
import { useCreateDapurMutation } from "@/features/dapur/api";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

const CreateDapurDialog = () => {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const createDapur = useCreateDapurMutation();

  const form = useForm<CreateDapurFormInputs>({
    resolver: zodResolver(createDapurSchema),
    defaultValues: { name: "", description: "" },
  });

  const submitHandler = async (data: CreateDapurFormInputs) => {
    setErrorMsg("");
    try {
      await createDapur.mutateAsync(data);
      setOpen(false);
      form.reset();
      toast({
        title: "Berhasil menambah dapur",
        description: `Dapur "${data.name}" berhasil dibuat.`,
      });
    } catch (err: unknown) {
      const e = err as AxiosError;
      switch (e.status) {
        case 409:
          setErrorMsg("Nama dapur sudah digunakan. Gunakan nama lain.");
          break;
        case 403:
          setErrorMsg("Anda tidak memiliki izin untuk menambah dapur.");
          break;
        default:
          setErrorMsg("Gagal menambah dapur. Coba lagi.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Dapur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Dapur Baru</DialogTitle>
          <DialogDescription>Masukkan informasi dapur yang akan ditambahkan</DialogDescription>
        </DialogHeader>
        <form
          id="create-dapur-form"
          onSubmit={form.handleSubmit(submitHandler)}
          className="grid gap-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Dapur</Label>
            <Input
              {...form.register("name")}
              id="name"
              placeholder="Contoh: Dapur Utama"
              disabled={createDapur.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              {...form.register("description")}
              id="description"
              placeholder="Deskripsi singkat dapur (opsional)"
              disabled={createDapur.isPending}
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={createDapur.isPending}>
            Batal
          </Button>
          <Button type="submit" form="create-dapur-form" disabled={createDapur.isPending}>
            Simpan
          </Button>
        </DialogFooter>
        {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default CreateDapurDialog;
