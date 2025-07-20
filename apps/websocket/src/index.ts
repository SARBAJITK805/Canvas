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
        let parsedData;
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = JSON.parse(data);
        }

        if (parsedData.type == "join_room") {
            const user = users.find(x => x.ws == ws)
            user?.rooms.push(parsedData.roomId.toString())
        }

        if (parsedData.type == "leave_room") {
            const user = users.find(x => x.ws == ws);
            if (user) {
                user.rooms = user.rooms.filter(room => room != parsedData.roomId);
            }
        }

        if (parsedData.type == "delete_shape") {
    const roomId = parsedData.roomId.toString();
    const shapeId = parsedData.shapeId;

    try {
        // Delete from database
        await prisma.chat.deleteMany({
            where: {
                roomId: Number(roomId),
                shapeId: shapeId
            }
        });

        // Broadcast deletion to all users in the room
        users.forEach(user => {                
            if (user.rooms.includes(roomId)) {                    
                user.ws.send(JSON.stringify({
                    type: "shape_deleted",
                    shapeId,
                    roomId
                }));
            }
        });

    } catch (error) {
        console.log("Error deleting shape:", error);                
    }
}

if (parsedData.type == "create_shape") {
    const roomId = parsedData.roomId.toString();
    const msg = parsedData.msg;
    const shapeId = parsedData.shapeId;

    try {
        await prisma.chat.create({
            data: {
                roomId: Number(roomId),
                message: msg,
                shapeId: shapeId,
                userId
            }
        });
        
        // Broadcast to all users in the room
        users.forEach(user => {                
            if (user.rooms.includes(roomId)) {                    
                user.ws.send(JSON.stringify({
                    type: "shape_created",
                    msg,
                    shapeId,
                    roomId
                }));
            }
        });

    } catch (error) {
        console.log("Error creating shape:", error);                
    }
}

        if (parsedData.type == "chat") {
            const roomId = parsedData.roomId.toString()
            const msg = parsedData.msg

            try {
                await prisma.chat.create({
                data: {
                    roomId:Number(roomId),
                    message: msg,
                    userId
                }
            })
            } catch (error) {
                console.log("error creating chat",error);                
            }
            users.forEach(user => {                
                if (user.rooms.includes(roomId)) {                    
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
