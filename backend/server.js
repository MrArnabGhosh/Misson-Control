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
import { fileURLToPath } from 'url';

const app=express();

const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file URL
const __dirname = path.dirname(__filename);
// --- End __dirname configuration ---

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

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`server running on port ${PORT}`))

