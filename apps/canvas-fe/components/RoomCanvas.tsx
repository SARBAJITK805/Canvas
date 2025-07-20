"use client"

import useSocket from "@/hooks/useSocket"
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";

export default function RoomCanvas({ roomId }: { roomId: string }) {
    const { loading, socket, sendMessage, incomingShapes, clearIncomingShapes } = useSocket(
        `${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNDE0ZDE2YS1mZWU5LTRkYzgtYWVmMy0yYmExZTQ5MjkxMDkiLCJpYXQiOjE3NTI1MTU3NjN9.E2bZJlZvgLiQ7bBlXDvQH0cqgjbzfBjRWuzM9mehcC0`, 
        roomId
    );
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Connecting to canvas...</div>
            </div>
        );
    }

    return (
        <Canvas 
            roomId={roomId} 
            sendShape={sendMessage}
            incomingShapes={incomingShapes}
            clearIncomingShapes={clearIncomingShapes}
        />
    );
}