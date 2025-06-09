import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from "cors"
import path from "path"
import connectDB from './config/db.js'
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"

const app=express();

app.use(
    cors({
        origin:process.env.CLIENT_URL || "*",
        methods:["GET","POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"]
    })
)

connectDB()

// middlewares
app.use(express.json())


// routes
app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/tasks",taskRoutes)
app.use("/api/reports",reportRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

