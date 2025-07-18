"use client";
import { useRef, useEffect, useState } from "react";
import { initDraw } from "@/draw";
import { Toolbar } from "@/components/Toolbar";

export function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeTool, setActiveTool] = useState(7); // Default to pencil

    const [dimensions, setDimensions] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 800,
        height: typeof window !== "undefined" ? window.innerHeight : 600,
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            initDraw(canvas, roomId, socket);
        }
    }, [canvasRef, dimensions, roomId, socket]);

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
            />
        </div>
    );
}
