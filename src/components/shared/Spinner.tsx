import { Loader2 } from "lucide-react";

interface SpinnerProps {
  color?: string;
  /** When true, renders inline without full-screen centering */
  inline?: boolean;
  /** Override size (default: 8) */
  size?: string;
}

const Spinner = ({ color, inline = false, size = "h-8 w-8" }: SpinnerProps) => {
  const icon = (
    <Loader2
      className={`animate-spin ${size} ${color ?? "text-primary"}`}
    />
  );

  if (inline) return icon;

  return (
    <div role="status" aria-label="Memuat" className="flex h-screen w-full items-center justify-center">
      {icon}
    </div>
  );
};

export default Spinner;
