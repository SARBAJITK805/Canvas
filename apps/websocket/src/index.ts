import { WebSocketServer, WebSocket } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/common_backend/config"
import { prisma } from "@repo/prisma/prisma"
const wss = new WebSocketServer({ port: 8080 })

interface User {
    ws: WebSocket,
    userId: string,
    rooms: string[]
}

const users: User[] = []

function checkUser(token: string): string | null {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || !(decoded as JwtPayload).userId) {
        return null;
    }
    return (decoded as JwtPayload).userId;
}

wss.on('connection', async (ws, request) => {
    const url = request.url;
    if (!url) {
        return
    }

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') ?? ""
    const userId = await checkUser(token)
    if (userId == null) {
        ws.close()
        return;
    }

    users.push({
        userId,
        ws,
        rooms: []
    })

    ws.on('message', async function message(data) {
        if (typeof data !== "string") {
            return;
        }
        const parseddData = JSON.parse(data)

        if (parseddData.type == "join_room") {
            const user = users.find(x => x.ws == ws)
            user?.rooms.push(parseddData.roomId)
        }

        if (parseddData.type == "leave_room") {
            const user = users.find(x => x.ws == ws);
            if (user) {
                user.rooms = user.rooms.filter(room => room != parseddData.roomId);
            }
        }

        if (parseddData.type == "chat") {
            const roomId = parseddData.roomId
            const msg = parseddData.msg

            await prisma.chat.create({
                data: {
                    roomId,
                    message: msg,
                    userId
                }
            })

            users.forEach(user => {
                if (roomId in user.rooms) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        msg,
                        roomId
                    }))
                }
            })

        }
    })
})
