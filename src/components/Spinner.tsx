import { Loader2 } from "lucide-react";

const Spinner = () => {
  return (
    <div className={`flex h-screen w-full items-center justify-center`}>
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
};

export default Spinner;
