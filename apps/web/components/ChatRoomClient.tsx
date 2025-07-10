"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({ messages, id }: {
    messages: { message: string }[];
    id: string
}) {
    const [chat, setChat] = useState(messages)
    const { socket, loading } = useSocket()
    const [currMsg, setCurrMsg] = useState<string>("")
    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }))
            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data)
                if (parsedData.type == "chat") {
                    setChat(c => [...c, { message: parsedData.msg }])
                }                
            }
        }
    }, [socket, loading, id])
    return <div>
        {chat.map(m =>
            <div>{m.message}</div>
        )}
        <input type="text" value={currMsg} onChange={(e) => setCurrMsg(e.target.value)} />
        <button onClick={() => {

            socket?.send(JSON.stringify({
                type: "chat",
                roomId: id,
                msg: currMsg
            }))
            setCurrMsg("")
        }}>
            Send
        </button>
    </div>
}