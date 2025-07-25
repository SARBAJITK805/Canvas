import { MousePointer, Square, Diamond, Circle, ArrowRight, Minus, Pencil, Type, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tools = [
  { icon: <MousePointer size={16} />, label: "1" },
  { icon: <Square size={16} />, label: "Rectangle" },
  { icon: <Diamond size={16} />, label: "Rhombus" },
  { icon: <Circle size={16} />, label: "Circle" },
  { icon: <ArrowRight size={16} />, label: "Arrow" },
  { icon: <Minus size={16} />, label: "Line" },
  { icon: <Pencil size={16} />, label: "Pencil" },
  { icon: <Type size={16} />, label: "Text" },
  { icon: <Eraser size={16} />, label: "Eraser" },
];

export function Toolbar({ activeToolIndex, onToolSelect, onShapeChange }: {
  activeToolIndex: number;
  onToolSelect: (index: number) => void;
  onShapeChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center space-x-1 bg-zinc-900 rounded-xl p-2 shadow-md w-fit mx-auto mb-4">
      {tools.map((tool, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          onClick={() => { onToolSelect(index); onShapeChange(tool.label) }}
          className={cn(
            "flex flex-col items-center justify-center h-10 w-10 text-white",
            activeToolIndex === index && "bg-zinc-700"
          )}>
          {tool.icon}
        </Button>
      ))}
    </div>
  );
}
