"use client"

import { Shape } from "@/components/Canvas";
import { useEffect, useRef, useState, useCallback } from "react";

export default function useSocket(url: string, roomId: string) {
    const [loading, setLoading] = useState(true);
    const [incomingShapes, setIncomingShapes] = useState<Shape[]>([])
    const socketRef = useRef<WebSocket | null>(null)

    const sendMessage = useCallback((data: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open");
        }
    }, []);

    useEffect(() => {
        const socket = new WebSocket(url)
        socketRef.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId,
            }))
            setLoading(false)
        }

        socket.onmessage = (event) => {
            const messages = JSON.parse(event.data);
            if (messages.type == "chat") {
                const parsedShape = JSON.parse(messages.msg);
                setIncomingShapes((prev) => [...prev, parsedShape]);
            }
        }

        return () => {
            socket.close();
        };

    }, [])

    return {
        socket: socketRef.current,
        loading,
        sendMessage,
        incomingShapes,
        clearIncomingShapes: () => setIncomingShapes([])
    };
}