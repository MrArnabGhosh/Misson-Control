import Task from "../models/Task.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"



const getUsers = async (req,res)=>{
    try {
        const users= await User.find({role:'member'}).select("-password")

        const userWithTaskCount = await Promise.all(users.map(async(user)=>{
            const pendingTasks = await Task.countDocuments({assignedTo:user._id,status:'Pending'})
            const inProgressTasks = await Task.countDocuments({assignedTo:user._id,status:"In Progress"})
            const completedTasks = await Task.countDocuments({assignedTo:user._id,status:"Completed"})

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            }
  
        }))
        res.json(userWithTaskCount)
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message})
    }
}

const getUserById = async (req,res)=>{
    try {
        const user = await User.findById(req.params.id).select("-password")

        if(!user){
            return res.ststus(404).json({message:"User not found"})
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message})
    }
}



export {getUsers,getUserById}