import { Shape } from "@/components/Canvas";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";

const[startX,setStartX]=useState(0);
const[startY,setStartY]=useState(0);
const [clicked,setClicked]=useState(false);

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

export function handelMouseDown(e:MouseEvent){
    setClicked(  true)
        setStartX ( e.clientX)
        setStartY ( e.clientY)
}

export function handelMouseMove(e:MouseEvent){
    if (clicked) {
            clearCanvas(existingShapes, canvas, ctx)
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY)
        }
}

export function handelMouseUp(e:MouseEvent){
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
}