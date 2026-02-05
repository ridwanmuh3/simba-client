import { Loader2 } from "lucide-react";

interface SpinnerProps {
  color: string;
}

const Spinner = ({ color }: SpinnerProps) => {
  return (
    <div className={`flex h-screen w-full items-center justify-center`}>
      <Loader2
        className={`animate-spin h-8 w-8 ${color ? color : "text-primary"}`}
      />
    </div>
  );
};

export default Spinner;
