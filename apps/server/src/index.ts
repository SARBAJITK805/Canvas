import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/common_backend/config"
import { authMiddleware } from "./middleware/authMiddleware"
import { CreateRoomSchema, SigninSchema, SignupSchema } from "@repo/common/types"
import { prisma } from "@repo/prisma/prisma"
import bcrypt from "bcryptjs"
import cors from "cors"
import { AuthRequest } from "./middleware/authMiddleware"
const app = express()
app.use(express.json())
app.use(cors());

app.post('/signin', async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({
            msg: "Incorrect inputs"
        })
        return
    }
    const resp = await prisma.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    })

    if (!resp) {
        res.status(403).json({
            msg: "User not found"
        })
        return
    }

    const isCorrect = await bcrypt.compare(parsedData.data.password, resp.password)
    if (!isCorrect) {
        res.status(403).json({
            msg: "Incorrect password"
        })
        return
    }
    const token = jwt.sign({
        userId: resp.id
    }, JWT_SECRET)
    res.json({
        msg: "Signin successful",
        token
    })
})

app.post('/signup', async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body) || ""
    if (!parsedData.success) {
        res.status(403).json({
            msg: "Incorrect inputs"
        })
        return
    }

    const hashedPass = await bcrypt.hash(parsedData.data.password, 10)

    try {
        const resp = await prisma.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: hashedPass
            }
        })
        res.json({
            msg: "User created successfully",
        })
        return
    } catch (error) {
        console.log("error while signup : " + error)
        res.status(403).json({
            msg: "Error while signup, email exists"
        })
        return
    }
})


app.post('/create-room', authMiddleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.json({
            msg: "Incorrect input format"
        })
        return
    }

    try {
        const room = await prisma.room.create({
            data: {
                adminId: (req as AuthRequest).userId,
                slug: parsedData.data?.name
            }
        })
        res.json({
            roomId: room.id
        })
    } catch (error) {
        console.log("Error creating room : ", error)
        res.status(403).json({
            msg: "slug exists"
        })
    }
})

app.get('/chats/:roomId', async (req, res) => {
    try {
        const roomId = Number(req.params.roomId)        
        const messages = await prisma.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 20
        })
        res.json({ messages })
    } catch (error) {
        console.log("error while getting messages ", error);
        res.status(403).json({
            msg: "error while getting messages"
        })
    }
})

app.get('/room/:slug', async (require, res) => {
    try {
        const slug = (require.params.slug)
        const room = await prisma.room.findFirst({
            where: {
                slug
            }
        })
        res.json({
            room
        })
    } catch (error) {
        console.log("error while getting room id ", error);
        res.status(403).json({
            msg: "error while getting room id"
        })

    }
})

app.delete('/chats/:roomId/:shapeId', authMiddleware, async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const shapeId = req.params.shapeId;
        
        // Delete the chat entry with this shapeId
        await prisma.chat.deleteMany({
            where: {
                roomId: roomId,
                shapeId: shapeId
            }
        });
        
        res.json({ 
            msg: "Shape deleted successfully",
            shapeId 
        });
    } catch (error) {
        console.log("Error deleting shape:", error);
        res.status(500).json({
            msg: "Error deleting shape"
        });
    }
});

app.listen(3001, () => {
    console.log("listening on port 3001");
})