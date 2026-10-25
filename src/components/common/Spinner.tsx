
import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export default function Spinner({
  size = 20,
  label = "Loading...",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2"
    >
      <LoaderCircle
        size={size}
        className="animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
