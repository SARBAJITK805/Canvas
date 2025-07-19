"use client";
import { useRef, useEffect, useState } from "react";
import { initDraw } from "@/draw";
import { Toolbar } from "@/components/Toolbar";
import { getShapes, drawExistingShapes, handelMouseDown, handelMouseMove, handelMouseUp } from "@/lib/actions";

export type Shape = {
    type: "Rectangle" | "Circle" | "Line" | "Triangle" | "Arrow" | "Rhombus" | "Pencil" | "Eraser" | "Text",
    startX: number,
    startY: number,
    width: number,
    height: number
}


export function Canvas({ roomId, socket, sendShape, incomingShapes, clearIncomingShapes }: {
    roomId: string;
    socket: WebSocket | null;
    sendShape: (shape: Shape) => void;
    incomingShapes: Shape[];
    clearIncomingShapes: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeTool, setActiveTool] = useState(7);
    const [existingShapes, setexistingShapes] = useState<Shape[]>([])


    useEffect(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    useEffect(() => {
        const getExistingShapes = async () => await getShapes(roomId, setexistingShapes);
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
            setexistingShapes((prev) => [...prev, ...incomingShapes]);
            clearIncomingShapes();
        }
    }, [incomingShapes, clearIncomingShapes])

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     if (canvas) {
    //         canvas.width = dimensions.width;
    //         canvas.height = dimensions.height;
    //          initDraw(canvas, roomId, socket);
    //     }
    // }, [canvasRef, dimensions, roomId, socket]);

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Toolbar activeToolIndex={activeTool} onToolSelect={setActiveTool} />
            </div>

            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={(event)=>handelMouseDown(event)}
                onMouseMove={(event)=>handelMouseMove(event)}
                onMouseUp={(event)=>handelMouseUp(event)}
            />
        </div>
    );
}
