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

function drawArrow(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    const headLength = 10;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
}

export function drawExistingShapes(existingShapes: Shape[], canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    existingShapes.map((shape) => {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        
        if (shape.type === "Rectangle") {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        } else if (shape.type === "Circle") {
            const centerX = shape.startX + shape.width / 2;
            const centerY = shape.startY + shape.height / 2;
            const radius = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === "Line") {
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;
            
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        } else if (shape.type === "Arrow") {
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;
            drawArrow(ctx, shape.startX, shape.startY, endX, endY);
        }
    });
}

export function handelMouseDown(e: MouseEvent, setStartPoint: any, canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
}

export function handelMouseMove(
    e: MouseEvent, 
    startPoint: { x: number, y: number } | null, 
    existingShapes: Shape[], 
    canvas: HTMLCanvasElement | null,
    selectedTool: string | null
) {
    if (!canvas) return;
    if (!startPoint) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawExistingShapes(existingShapes, canvas);
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    
    if (selectedTool === "Rectangle") {
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (selectedTool === "Circle") {
        const centerX = startPoint.x + width / 2;
        const centerY = startPoint.y + height / 2;
        const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (selectedTool === "Line") {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else if (selectedTool === "Arrow") {
        drawArrow(ctx, startPoint.x, startPoint.y, currentX, currentY);
    }
}

export function handelMouseUp(
    e: MouseEvent, 
    startPoint: { x: number, y: number } | null, 
    setExistingShapes: any, 
    canvas: HTMLCanvasElement | null, 
    setStartPoint: any, 
    roomId: string, 
    sendShape: any,
    selectedTool: string | null
) {
    if (!canvas) return;
    if (!startPoint) return;
    if (!selectedTool) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;
    
    const shape: Shape = {
        type: selectedTool as Shape["type"],
        startX: startPoint.x,
        startY: startPoint.y,
        width,
        height
    };
    
    setExistingShapes((prev: any) => [...prev, shape]);
    sendShape({
        type: "chat",
        msg: JSON.stringify(shape),
        roomId: roomId,
    });
    setStartPoint(null);
}