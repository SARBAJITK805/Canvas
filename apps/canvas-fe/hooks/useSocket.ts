"use client"

import { Shape } from "@/components/Canvas";
import { useEffect, useRef, useState, useCallback } from "react";

export default function useSocket(url: string, roomId: string) {
    const [loading, setLoading] = useState(true);
    const [incomingShapes, setIncomingShapes] = useState<Shape[]>([]);
    const [deletedShapeIds, setDeletedShapeIds] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    const sendMessage = useCallback((data: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open");
        }
    }, []);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId,
            }));
            setLoading(false);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === "shape_created") {
                const parsedShape = JSON.parse(message.msg);
                parsedShape.id = message.shapeId;
                setIncomingShapes((prev) => [...prev, parsedShape]);
            } else if (message.type === "shape_deleted") {
                setDeletedShapeIds((prev) => [...prev, message.shapeId]);
            }
        };

        return () => {
            socket.close();
        };
    }, [url, roomId]);

    return {
        socket: socketRef.current,
        loading,
        sendMessage,
        incomingShapes,
        deletedShapeIds,
        clearIncomingShapes: () => setIncomingShapes([]),
        clearDeletedShapeIds: () => setDeletedShapeIds([])
    };
}