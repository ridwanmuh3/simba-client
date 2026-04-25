import { useState } from "react";
import { useNavigate } from "react-router";
import { ChefHat, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/context";
import { useGetDapurs, useSelectDapurMutation } from "@/features/dapur/api";
import { toast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import logoBgn from "@/assets/sppg.webp";

const SelectDapur = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: dapurs, isLoading: isLoadingDapurs } = useGetDapurs();
  const selectMutation = useSelectDapurMutation();
  const [selecting, setSelecting] = useState<number | null>(null);

  const handleSelect = async (dapurId: number) => {
    setSelecting(dapurId);
    try {
      await selectMutation.mutateAsync({ dapur_id: dapurId });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.current });
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

  const activeDapurs = dapurs?.filter((d) => d.is_active) ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={logoBgn} alt="Logo" className="w-14 h-14 rounded-xl object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Pilih Dapur</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Halo, <span className="font-medium text-foreground">{user?.fullname}</span>.
              Pilih dapur yang akan Anda kelola.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dapur Tersedia</CardTitle>
            <CardDescription>Pilih salah satu dapur untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingDapurs ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeDapurs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Tidak ada dapur aktif. Hubungi Super Admin.
              </p>
            ) : (
              activeDapurs.map((dapur) => (
                <button
                  key={dapur.id}
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
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );
};

export default SelectDapur;
