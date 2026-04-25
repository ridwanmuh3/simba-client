import { useState } from "react";
import { useNavigate } from "react-router";
import { ChefHat, Loader2, LogOut, Plus } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context";
import type { AuthUser } from "@/features/auth/types";
import { useGetDapurs, useSelectDapurMutation, useCreateDapurMutation } from "@/features/dapur/api";
import { toast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import logoBgn from "@/assets/sppg.webp";
import dayjs from "dayjs";
import { UserRole } from "@/features/users/types";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const SelectDapur = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: dapurs, isLoading: isLoadingDapurs } = useGetDapurs();
  const selectMutation = useSelectDapurMutation();
  const createMutation = useCreateDapurMutation();
  const [selecting, setSelecting] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const activeDapurs = dapurs?.filter((d) => d.isActive) ?? [];

  const handleSelect = async (dapurId: number) => {
    setSelecting(dapurId);
    try {
      await selectMutation.mutateAsync({ dapur_id: dapurId });
      queryClient.setQueryData<AuthUser>(queryKeys.auth.current, (old) =>
        old ? { ...old, currentDapurId: dapurId } : old,
      );
      toast({ title: "Dapur dipilih", description: "Mengalihkan ke dashboard..." });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      let msg = "Gagal memilih dapur. Coba lagi.";
      if (isAxiosError(e)) {
        const status = e.response?.status;
        if (status === 404) msg = "Dapur tidak ditemukan.";
        else if (status === 403) msg = "Dapur tidak aktif.";
      }
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    } finally {
      setSelecting(null);
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: createName.trim(),
        description: createDesc.trim() || undefined,
      });
      toast({ title: "Dapur dibuat", description: `Dapur "${createName.trim()}" berhasil ditambahkan.` });
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
    } catch (e) {
      let msg = "Gagal membuat dapur. Coba lagi.";
      if (isAxiosError(e) && e.response?.status === 409) msg = "Nama dapur sudah digunakan.";
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — brand panel, identical to Login */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center mb-8">
              <img
                src={logoBgn}
                alt="Logo BGN"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">SIMBA</h1>
            <p className="text-xl text-primary-foreground/80 max-w-md">
              Sistem Informasi Manajemen Barang dan Anggaran
            </p>
          </div>
        </div>
      </div>

      {/* Right — content panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src={logoBgn}
              alt="Logo BGN"
              className="w-12 h-12 rounded-xl object-contain"
            />
            <span className="text-2xl font-bold">SIMBA</span>
          </div>

          <Card className="border-0 shadow-lifted">
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-2xl font-bold">Pilih Dapur</CardTitle>
              <CardDescription>
                Halo, <span className="font-medium text-foreground">{user?.fullname}</span>.
                Pilih dapur yang akan Anda kelola.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dapur list */}
                <AnimatePresence mode="wait">
                  {isLoadingDapurs ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : activeDapurs.length === 0 ? (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-sm text-muted-foreground py-4"
                    >
                      {isSuperAdmin
                        ? "Belum ada dapur. Tambahkan dapur pertama."
                        : "Tidak ada dapur aktif. Hubungi Super Admin."}
                    </motion.p>
                  ) : (
                    <motion.div
                      key="list"
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      {activeDapurs.map((dapur) => (
                        <motion.button
                          key={dapur.id}
                          variants={itemVariants}
                          onClick={() => handleSelect(dapur.id)}
                          disabled={selectMutation.isPending}
                          className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <ChefHat className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground">{dapur.name}</p>
                            {dapur.description && (
                              <p className="text-xs text-muted-foreground truncate">{dapur.description}</p>
                            )}
                          </div>
                          {selecting === dapur.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                {isSuperAdmin && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Dapur Baru
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full h-11 font-semibold text-muted-foreground"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © {dayjs().year()} SIMBA. All rights reserved.
          </p>
        </motion.div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Dapur Baru</DialogTitle>
            <DialogDescription>Buat dapur baru untuk dikelola oleh tim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dapur-name">Nama Dapur <span className="text-red-500">*</span></Label>
              <Input
                id="dapur-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="cth. Dapur Pusat"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dapur-desc">Deskripsi</Label>
              <Input
                id="dapur-desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Opsional"
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!createName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectDapur;
