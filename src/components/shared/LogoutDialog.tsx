import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { LogOut } from "lucide-react";

interface LogoutDialogProps {
  collapsedSidebar: boolean;
  logoutHandler: () => void;
}

const LogoutDialog = ({
  collapsedSidebar,
  logoutHandler,
}: LogoutDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full">
        <LogOut className="w-5 h-5 shrink-0" />
        <span
          className={
            collapsedSidebar
              ? "font-medium whitespace-nowrap overflow-hidden max-w-0 opacity-0 transition-all duration-200"
              : "font-medium whitespace-nowrap overflow-hidden max-w-24 opacity-100 transition-all duration-200"
          }
        >
          Keluar
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Apakah anda yakin ingin logout?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Anda akan keluar dari sistem. Perlu login kembali jika ingin
            menggunakan sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/80"
            onClick={logoutHandler}
          >
            Yakin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutDialog;
