import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { authMiddleware } from "./middleware/authMiddleware"
import { SigninSchema, SignupSchema } from "@repo/common/types"
import { prisma } from "@repo/prisma/prisma"
import bcrypt from "bcrypt"
const app = express()
app.use(express.json())

app.post('/signin', (req, res) => {
    const data = SigninSchema.safeParse(req.body)
    if (!data.success) {
        res.json({
            msg: "Incorrect inputs"
        })
        return
    }
    // Add your signin logic here, for now just send a success response
    res.json({
        msg: "Signin successful"
    })
})

app.post('/signup', async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body) || ""
    if (!parsedData.success) {
        res.json({
            msg: "Incorrect inputs"
        })
        return
    }

    const hashedPass = await bcrypt.hash(parsedData.data.password, 10)

    const resp = await prisma.user.create({
        data: {
            name: parsedData.data.name,
            email: parsedData.data.email,
            password: parsedData.data.password,
        }
    })
    const token = jwt.sign(
        { email, name, userId },
        JWT_SECRET
    )
    res.json({ token })
})

app.post('/create-room', authMiddleware, (req, res) => {
    //db call 
    res.json({
        roomId: 123
    })
})

app.get('/room', authMiddleware, (req, res) => {

})

app.listen(3001)