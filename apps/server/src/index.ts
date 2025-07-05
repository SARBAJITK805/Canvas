import express from "express"
import jwt from "jsonwebtoken"
const app=express()
app.use(express.json())

app.post('/signin',(req,res)=>{

})

app.post('/signin',(res,req)=>{
    const {email,password,name}=req.json()
    //database call


})

app.post('/create-room',authMiddleware,(req,res)=>{

})

app.listen(3001)