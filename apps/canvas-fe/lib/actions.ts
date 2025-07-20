import { Shape } from "@/components/Canvas";
import { BACKEND_URL } from "@/config";
import axios from "axios";

function isPointInShape(x: number, y: number, shape: Shape): boolean {
    switch (shape.type) {
        case "Rectangle":
            return x >= shape.startX && 
                   x <= shape.startX + shape.width && 
                   y >= shape.startY && 
                   y <= shape.startY + shape.height;
        
        case "Circle":
            const centerX = shape.startX + shape.width / 2;
            const centerY = shape.startY + shape.height / 2;
            const radius = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            return distance <= radius;
        
        case "Line":
        case "Arrow":
            const endX = shape.startX + shape.width;
            const endY = shape.startY + shape.height;
            const threshold = 5;
            const lineLength = Math.sqrt(shape.width ** 2 + shape.height ** 2);
            
            if (lineLength === 0) return false;
            
            const t = Math.max(0, Math.min(1, 
                ((x - shape.startX) * shape.width + (y - shape.startY) * shape.height) / (lineLength ** 2)
            ));
            
            const projX = shape.startX + t * shape.width;
            const projY = shape.startY + t * shape.height;
            const distToLine = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
            
            return distToLine <= threshold;
        
        case "Rhombus":
            const rhombusCenterX = shape.startX + shape.width / 2;
            const rhombusCenterY = shape.startY + shape.height / 2;
            const dx = Math.abs(x - rhombusCenterX);
            const dy = Math.abs(y - rhombusCenterY);
            return (dx / (Math.abs(shape.width) / 2) + dy / (Math.abs(shape.height) / 2)) <= 1;
        
        case "Text":
            if (!shape.text) return false;
            const textWidth = shape.text.length * ((shape.fontSize || 16) * 0.6);
            const textHeight = shape.fontSize || 16;
            return x >= shape.startX && 
                   x <= shape.startX + textWidth && 
                   y >= shape.startY - textHeight && 
                   y <= shape.startY;
        
        default:
            return false;
    }
}

export async function getShapes(roomId: string, setexistingShapes: (arg: any) => void) {
    try {
        const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
        const messages = response.data.messages;
        const shapes = messages.map((msg: any) => {
            const shapeData = JSON.parse(msg.message);
            return {
                ...shapeData,
                id: msg.shapeId || `shape_${msg.id}`
            };
        });
        console.log(shapes);
        setexistingShapes(shapes);
    } catch (error) {
        console.error("Error fetching shapes:", error);
    }
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

function drawRhombus(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number) {
    const centerX = startX + width / 2;
    const centerY = startY + height / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, startY); 
    ctx.lineTo(startX + width, centerY);
    ctx.lineTo(centerX, startY + height); 
    ctx.lineTo(startX, centerY); 
    ctx.closePath();
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
        } else if (shape.type === "Text") {
            if (shape.text) {
                ctx.fillStyle = "#000000";
                ctx.font = `${shape.fontSize || 16}px Arial`;
                ctx.fillText(shape.text, shape.startX, shape.startY);
            }
        } else if (shape.type === "Rhombus") {
            drawRhombus(ctx, shape.startX, shape.startY, shape.width, shape.height);
        }
    });
}

export async function handleEraserClick(
    e: MouseEvent,
    canvas: HTMLCanvasElement | null,
    existingShapes: Shape[],
    setExistingShapes: (shapes: Shape[]) => void,
    roomId: string,
    sendShape: any
) {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let i = existingShapes.length - 1; i >= 0; i--) {
        const shape = existingShapes[i];
        
        if (isPointInShape(x, y, shape)) {
            sendShape({
                type: "delete_shape",
                shapeId: shape.id,
                roomId: roomId,
            });
            
            const updatedShapes = existingShapes.filter((_, index) => index !== i);
            setExistingShapes(updatedShapes);
            
            break;
        }
    }
}

export function handelMouseDown(e: MouseEvent, setStartPoint: any, canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
}

export function handelCanvasClick(
    e: MouseEvent,
    canvas: HTMLCanvasElement | null,
    setTextPosition: (pos: { x: number, y: number } | null) => void,
    setIsTextMode: (mode: boolean) => void
) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTextPosition({ x, y });
    setIsTextMode(true);
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
    } else if (selectedTool === "Rhombus") {
        drawRhombus(ctx, startPoint.x, startPoint.y, width, height);
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
    
    // Generate unique ID for the shape
    const shapeId = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const shape: Shape = {
        id: shapeId,
        type: selectedTool as Shape["type"],
        startX: startPoint.x,
        startY: startPoint.y,
        width,
        height
    };
    
    setExistingShapes((prev: any) => [...prev, shape]);
    sendShape({
        type: "create_shape",
        msg: JSON.stringify(shape),
        shapeId: shapeId,
        roomId: roomId,
    });
    setStartPoint(null);
}