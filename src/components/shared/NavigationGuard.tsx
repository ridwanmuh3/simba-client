import { useBlocker } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function useNavigationGuard(isDirty: boolean) {
  return useBlocker(isDirty);
}

type Blocker = ReturnType<typeof useNavigationGuard>;

interface NavigationGuardDialogProps {
  blocker: Blocker;
}

export function NavigationGuardDialog({ blocker }: NavigationGuardDialogProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tinggalkan halaman?</AlertDialogTitle>
          <AlertDialogDescription>
            Ada perubahan yang belum disimpan. Jika Anda pergi sekarang, semua
            perubahan akan hilang.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset()}>
            Tetap di sini
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => blocker.proceed()}>
            Tinggalkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
