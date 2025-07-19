import { Lock, Hand, MousePointer, Square, Diamond, Circle, ArrowRight, Minus, Pencil, Type, ImageIcon, Eraser, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tools = [
  { icon: <Lock size={16} />, label: "" },
  { icon: <Hand size={16} />, label: "" },
  { icon: <MousePointer size={16} />, label: "1" },
  { icon: <Square size={16} />, label: "2" },
  { icon: <Diamond size={16} />, label: "3" },
  { icon: <Circle size={16} />, label: "4" },
  { icon: <ArrowRight size={16} />, label: "5" },
  { icon: <Minus size={16} />, label: "6" },
  { icon: <Pencil size={16} />, label: "7" },
  { icon: <Type size={16} />, label: "8" },
  { icon: <ImageIcon size={16} />, label: "9" },
  { icon: <Eraser size={16} />, label: "0" },
  { icon: <LayoutGrid size={16} />, label: "" },
];

export function Toolbar({ activeToolIndex, onToolSelect }: {
  activeToolIndex: number;
  onToolSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center space-x-1 bg-zinc-900 rounded-xl p-2 shadow-md w-fit mx-auto mb-4">
      {tools.map((tool, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          onClick={() => onToolSelect(index)}
          className={cn(
            "flex flex-col items-center justify-center h-10 w-10 text-white",
            activeToolIndex === index && "bg-zinc-700"
          )}
        >
          {tool.icon}
          {tool.label && (
            <span className="text-xs text-zinc-400">{tool.label}</span>
          )}
        </Button>
      ))}
    </div>
  );
}
