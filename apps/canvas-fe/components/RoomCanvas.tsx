"use client"

import useSocket from "@/hooks/useSocket"
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";

export default function RoomCanvas({ roomId }: { roomId: string }) {
    const { loading, socket, sendMessage, incomingShapes, clearIncomingShapes,deletedShapeIds,clearDeletedShapeIds } = useSocket(
        `${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYzE2Y2I1Ny1mYjg3LTRhMTEtOTkyNi02MWY1MTNhNzg1NGYiLCJpYXQiOjE3NTM0MjI5MDB9.8FdjvYvVoSfVl3cfB16UWRo3vQW1MfInHYd5KP21TkM`, 
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
            deletedShapeIds={deletedShapeIds}
            clearDeletedShapeIds={clearDeletedShapeIds}

        />
    );
}