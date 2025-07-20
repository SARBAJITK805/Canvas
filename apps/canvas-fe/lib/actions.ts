import { Shape } from "@/components/Canvas";
import { BACKEND_URL } from "@/config";
import axios from "axios";


export async function getShapes(roomId: string, setexistingShapes: (arg: any) => void) {
    const reps = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const message = reps.data.messages;
    const shapes = message.map((msg: any) => {
        return JSON.parse(msg.message);
    })
    console.log(shapes);
    setexistingShapes(shapes);
    return;
}

export function drawExistingShapes(existingShapes: Shape[], canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    existingShapes.map((shape) => {
        if (shape.type == "Rectangle") {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height)
        }
    })
}

export function handelMouseDown(e: MouseEvent, setStartPoint: any, canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
}

export function handelMouseMove(e: MouseEvent, startPoint: { x: number, y: number } | null, existingShapes: Shape[], canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    if (!startPoint) return;
    const ctx = canvas.getContext("2d");
    //clearCanvas(existingShapes, canvas, ctx)
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    drawExistingShapes(existingShapes, canvas);
    ctx?.strokeRect(startPoint.x, startPoint.y, e.clientX - startPoint.x, e.clientY - startPoint.y)
}

export function handelMouseUp(e: MouseEvent, startPoint: { x: number, y: number } | null, setExistingShapes: any, canvas: HTMLCanvasElement | null, setStartPoint: any, roomId: string, socket: WebSocket | null) {
    if (!canvas) return;
    if (!startPoint) return;
    if (!socket) return;
    const width = e.clientX - startPoint.x
    const height = e.clientY - startPoint.y
    const shape: Shape = {
        type: "Rectangle",
        startX: startPoint.x,
        startY: startPoint.y,
        width,
        height
    }
    setExistingShapes((prev: any) => [...prev, shape]);
    socket.send(
        JSON.stringify({
            type: "chat",
            msg: JSON.stringify(shape),
            roomId: roomId,
        })
    )
    setStartPoint(null);
}