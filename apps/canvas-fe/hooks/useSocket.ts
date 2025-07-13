import { WS_URL } from "@/config";
import { useEffect, useState } from "react";

export default function useSocket(roomId:string) {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null)
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}`)
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