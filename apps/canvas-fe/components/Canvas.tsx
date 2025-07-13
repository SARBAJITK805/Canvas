import { initDraw } from "@/draw";
import { useRef, useEffect } from "react";

export function Canvas({ roomId ,socket}: {
    roomId: string,
    socket:WebSocket|null;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            initDraw(canvas, roomId,socket)
        }

    }, [canvasRef])

    return (
        <>
            <canvas ref={canvasRef} width={2000} height={2000}></canvas>
        </>
    )
}