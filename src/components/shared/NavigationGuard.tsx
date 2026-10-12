import { useEffect } from "react";
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

/**
 * Navigation guard for forms with unsaved changes.
 *
 * react-router's `useBlocker` only works inside a *data router*
 * (createBrowserRouter / RouterProvider). This app is mounted on a component
 * router (`<BrowserRouter>` + `<Routes>`), where `useBlocker` throws
 * "useBlocker must be used within a data router" and crashes the items page
 * (rendered inside the items tabs). We therefore fall back to the
 * always-available `beforeunload` event, which guards tab close / refresh, and
 * expose an inert blocker object so the existing NavigationGuardDialog call
 * sites keep compiling.
 *
 * ponytail: when the app migrates to a data router, restore
 * `useBlocker(isDirty)` here to re-enable the in-app "Tinggalkan halaman?" dialog.
 */
export function useNavigationGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return { state: "idle", reset: () => {}, proceed: () => {} };
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
