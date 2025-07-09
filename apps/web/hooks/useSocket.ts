import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket() {
    const [loading, setLoading] = useState<boolean>(true)
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYzIyNmFjZC0yNzQ1LTRmMTctODRkNC0xZjE0NTJmNTc2NGEiLCJpYXQiOjE3NTE5NzA4Njd9.kdANVr-yeUrkLvye7UGCkSwPyxVTe0OKlriyGlka8nc`)
        ws.onopen = () => {
            setLoading(false)
            setSocket(ws)
        }
    }, [])

    return {
        socket,
        loading
    }
}