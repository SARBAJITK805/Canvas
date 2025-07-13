import useSocket from "@/hooks/useSocket"
import { Canvas } from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
    const { loading, socket } = useSocket(roomId);
    if (loading) {
        return (
            <div>
                Currently loading !!!!
            </div>
        )
    }

    return (
        <Canvas roomId={roomId} socket={socket}/>
    )
}