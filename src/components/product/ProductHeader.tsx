import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductHeaderProps {
  title: string;
  onClose: () => void;
}

export function ProductHeader({ title, onClose }: ProductHeaderProps) {
  return (
    <div className="border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="shrink-0"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
