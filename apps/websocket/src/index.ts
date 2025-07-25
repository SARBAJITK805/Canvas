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

async function checkUser(token: string): Promise<string | null> {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!decoded || !decoded.userId) {
            return null;
        }
        
        // Verify user exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user) {
            console.log(`User with ID ${decoded.userId} not found in database`);
            return null;
        }
        
        return decoded.userId;
    } catch (error) {
        console.log("Token verification error:", error);
        return null;
    }
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

    console.log(`User ${userId} connected`);

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
            console.log(`User ${userId} joined room ${parsedData.roomId}`);
        }

        if (parsedData.type == "leave_room") {
            const user = users.find(x => x.ws == ws);
            if (user) {
                user.rooms = user.rooms.filter(room => room != parsedData.roomId);
                console.log(`User ${userId} left room ${parsedData.roomId}`);
            }
        }

        if (parsedData.type == "create_shape") {
            console.log("Creating shape:", parsedData);            
            const roomId = parsedData.roomId.toString()
            const msg = parsedData.msg
            const shapeId = parsedData.shapeId

            try {
                // Verify user still exists before creating chat
                const userExists = await prisma.user.findUnique({
                    where: { id: userId }
                });

                if (!userExists) {
                    console.log(`User ${userId} no longer exists in database`);
                    return;
                }

                // Verify room exists
                const roomExists = await prisma.room.findUnique({
                    where: { id: Number(roomId) }
                });

                if (!roomExists) {
                    console.log(`Room ${roomId} does not exist`);
                    return;
                }

                await prisma.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message: msg,
                        userId,
                        shapeId: shapeId
                    }
                })

                console.log(`Shape created successfully for user ${userId} in room ${roomId}`);
            } catch (error) {
                console.log("Error creating shape:", error);                
                return;
            }
            
            users.forEach(user => {                
                if (user.rooms.includes(roomId) && user.ws !== ws) {                    
                    user.ws.send(JSON.stringify({
                        type: "shape_created",
                        msg,
                        shapeId,
                        roomId
                    }))
                }
            })
        }

        if (parsedData.type == "delete_shape") {
            const roomId = parsedData.roomId.toString()
            const shapeId = parsedData.shapeId

            try {
                await prisma.chat.deleteMany({
                    where: {
                        roomId: Number(roomId),
                        shapeId: shapeId
                    }
                })

                console.log(`Shape ${shapeId} deleted from room ${roomId}`);
            } catch (error) {
                console.log("Error deleting shape:", error);                
                return;
            }
            
            users.forEach(user => {                
                if (user.rooms.includes(roomId) && user.ws !== ws) {                    
                    user.ws.send(JSON.stringify({
                        type: "shape_deleted",
                        shapeId,
                        roomId
                    }))
                }
            })
        }

        if (parsedData.type == "chat") {
            const roomId = parsedData.roomId.toString()
            const msg = parsedData.msg

            try {
                // Verify user still exists before creating chat
                const userExists = await prisma.user.findUnique({
                    where: { id: userId }
                });

                if (!userExists) {
                    console.log(`User ${userId} no longer exists in database`);
                    return;
                }

                await prisma.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message: msg,
                        userId
                    }
                })
            } catch (error) {
                console.log("Error creating chat:", error);                
                return;
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

    ws.on('close', () => {
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            console.log(`User ${userId} disconnected`);
            users.splice(index, 1);
        }
    });
})