"use client";
import { useRef, useEffect, useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { getShapes, drawExistingShapes, handelMouseDown, handelMouseMove, handelMouseUp } from "@/lib/actions";

export type Shape = {
    type: "Rectangle" | "Circle" | "Line" | "Triangle" | "Arrow" | "Rhombus" | "Pencil" | "Eraser" | "Text",
    startX: number,
    startY: number,
    width: number,
    height: number
}

export function Canvas({ roomId, sendShape, incomingShapes, clearIncomingShapes }: {
    roomId: string;
    sendShape: any;
    incomingShapes: Shape[];
    clearIncomingShapes: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeTool, setActiveTool] = useState(1);
    const [selectedTool, setSelectedTool] = useState<"Rectangle" | "Circle" | "Line" | "Triangle" | "Arrow" | "Rhombus" | "Pencil" | "Eraser" | "Text" | null>("Rectangle")
    const [existingShapes, setExistingShapes] = useState<Shape[]>([])
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null)
    const [endPoint, setEndPoint] = useState<{ x: number, y: number } | null>(null)

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const getExistingShapes = async () => await getShapes(roomId, setExistingShapes);
        const drawExistingShape = () => {
            if (canvasRef.current) {
                drawExistingShapes(existingShapes, canvasRef.current);
            }
        };
        getExistingShapes();
        drawExistingShape();
    }, [roomId, existingShapes])

    useEffect(() => {
        if (canvasRef.current && incomingShapes.length > 0) {
            drawExistingShapes(incomingShapes, canvasRef.current);
            setExistingShapes((prev) => [...prev, ...incomingShapes]);
            clearIncomingShapes();
        }
    }, [incomingShapes, clearIncomingShapes])

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Toolbar
                    activeToolIndex={activeTool}
                    onToolSelect={setActiveTool}
                    onShapeChange={(value: string) => setSelectedTool(value as any)}
                />
            </div>

            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={(event) => handelMouseDown(event.nativeEvent, setStartPoint, canvasRef.current)}
                onMouseMove={(event) => handelMouseMove(event.nativeEvent, startPoint, existingShapes, canvasRef.current, selectedTool)}
                onMouseUp={(event) => handelMouseUp(event.nativeEvent, startPoint, setExistingShapes, canvasRef.current, setStartPoint, roomId, sendShape, selectedTool)}
            />
        </div>
    );
}