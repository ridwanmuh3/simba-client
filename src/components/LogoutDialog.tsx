import { motion } from "framer-motion";
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
} from "./ui/alert-dialog";
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
        <motion.span
          initial={false}
          animate={{
            opacity: collapsedSidebar ? 0 : 1,
            width: collapsedSidebar ? 0 : "auto",
          }}
          className="font-medium whitespace-nowrap overflow-hidden"
        >
          Keluar
        </motion.span>
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
