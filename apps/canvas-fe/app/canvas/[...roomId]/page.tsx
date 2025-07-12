"use client"

import { initDraw } from "@/draw"
import { useEffect, useRef } from "react"
export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
           initDraw(canvas)
        }

    }, [canvasRef])

    return (
        <>
            <canvas ref={canvasRef} width={2000} height={2000}></canvas>
        </>
    )
}