import { BACKEND_URL } from "@/config";
import axios from "axios";

type Shapes = {
    type: "rectangle",
    startX: number,
    startY: number,
    width: number,
    height: number
} | {
    type: "circle",
    startX: number,
    startY: number,
    width: number,
    height: number
}

function clearCanvas(existingShapes: Shapes[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {  
        if (shape.type == "rectangle") {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height)
        }
    })
}

async function getShapes(roomId: string) {
    const reps = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const message = reps.data.messages;
    const shapes = message.map((msg: any) => {
        return JSON.parse(msg.message);
    })
    console.log(shapes);
    return shapes;

}


export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket | null) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shapes[] = await getShapes(roomId)

    if (!ctx || !socket) return
    socket.onmessage = (event) => {
        const messages = JSON.parse(event.data);
        console.log("present");        
        if (messages.type == "chat") {
            const parsedShape = JSON.parse(messages.msg);            
            existingShapes.push(parsedShape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    let startX = 0;
    let startY = 0
    let clicked = false

    clearCanvas(existingShapes, canvas, ctx);

    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        startX = e.clientX
        startY = e.clientY
    })
    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            clearCanvas(existingShapes, canvas, ctx)
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY)
        }
    })
    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        const width = e.clientX - startX
        const height = e.clientY - startY
        const shape: Shapes = {
            type: "rectangle",
            startX,
            startY,
            width,
            height
        }
        existingShapes.push(shape)
        socket.send(
            JSON.stringify({
                type: "chat",
                msg: JSON.stringify(shape),
                roomId:roomId,
            })
        )
    })
}