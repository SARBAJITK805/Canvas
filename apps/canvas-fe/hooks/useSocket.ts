"use client"

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";

export default function useSocket(roomId:string) {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null)
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNDE0ZDE2YS1mZWU5LTRkYzgtYWVmMy0yYmExZTQ5MjkxMDkiLCJpYXQiOjE3NTI1MTU3NjN9.E2bZJlZvgLiQ7bBlXDvQH0cqgjbzfBjRWuzM9mehcC0`)
        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId,
            }))
            setLoading(false)
        }
    }, [])

    return { loading, socket };
}