import Task from "../models/Task.js"



const getTasks = async(req,res)=>{
    try {
        const {status} = req.query
        let filter = {}

        if(status){
            filter.status = status
        }
        let tasks;
        if(req.user.role ==="admin"){
            tasks = await Task.find(filter).populate("assignedTo","name email profileImageUrl")
        }

        tasks = await Promise.all(
            tasks.map(async(task)=>{
                const completedCount = task.todoChecklist.filter((item)=>item.complete).length
                return { ...task._doc,completedTodoCount:completedCount}
            })
        )
        const allTasks = await Task.countDocuments(
            req.user.role ==="admin" ? {}:{assignedTo:req.user._id}
        )

        const pendingTasks = await Task.countDocuments(
            {
                ...filter,
                status:"Pending",
                ...Task(req.user.role !== "admin" && {assignedTo:req.user._id})
            }
        )

        const inProgressTasks = await Task.countDocuments(
            {
                ...filter,
                status:"In Pogress",
                ...Task(req.user.role !== "admin" && {assignedTo:req.user._id})
            }
        )

        const completedTasks = await Task.countDocuments(
            {
                ...filter,
                status:"Completed",
                ...Task(req.user.role !== "admin" && {assignedTo:req.user._id})
            }
        )

        res.json({
            tasks,
            statusSummary:{
                all:allTasks,
                pendingTasks,
                completedTasks,
                inProgressTasks,
            },
        })
    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const getTaskById = async(req,res)=>{
    try {
        const task = await Task.findById(req.user._id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )
        if(!task){
            return res.status(400).json({message: "Task not found "})
        }
        res.json(task)
    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const createTask = async(req,res)=>{
    try {
        const {title,description,priority,dueDate,assignedTo,attachments,todoChecklist} = req.body
        if(!Array.isArray(assignedTo)){
            return res.status(400).json({message: "assigned must be an array of user IDs"})
        }
        const task = await Task.create({
            title,description,priority,dueDate,assignedTo,createdBy:req.user._id, todoChecklist,attachments,
        })
        res.status(200).json({messsage:"Task created Successfully",task})
    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const updateTask = async(req,res)=>{
    try {
        const task = await Task.findById(req.params.id)
        if(!task){
            return res.status(404).json({message:"Task not found"})
        }
        task.title = req.body.title || task.title
        task.description = req.body.description ||task.description
        task.priority = req.body.priority || task.priority
        task.dueDate = req.body.dueDate || task.dueDate
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist
        task.attachments = req.body.attachments ||task.attachments

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return res.status(400).json({message:"assigned must be an user IDs"})
            }
            task.assignedTo = req.body.assignedTo
        }

        const updateTask = await task.save()
        res.json({message:"Task updated successfully",updateTask})
    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const deleteTask = async(req,res)=>{
    try {
        const task = await Task.findById(req.params.id)
        if(!task){
            return res.ststus(404).json({message:"Task not found"})
        }
        await task.deleteOne()
        res.json({message:"Task deleted successfully"})
    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const updateTaskStatus = async(req,res)=>{
    try {
        const task =  await Task.findById(req.params.id)
        if(!task) return res.status(404).json({message:"Task not found "})
        
        const isAssigned = task.assignedTo.some(
            (userId)=> userId.toString()===req.user._id.toString()
        )
        if(!isAssigned && req.user.id !=="admin"){
            return res.ststus(403).json({message:"Not Authorized"})
        }

        task.status = req.body.ststus ||task.status

        if(task.status === "Complete"){
            task.todoChecklist.forEach((item)=>(item.completed= true))
            task.progress = 100
        }

        await task.save()
        res.json({message:"Task status Updated",task})

    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const updateTaskChecklist = async(req,res)=>{
    try {
        const { todoChecklist } = req.body
        const task =  await Task.findById(req.params.id)
        if(!task) return res.ststus(404).json({message:"Task Not Found"})
        
        if(!task.assignedTo.includes(req.user._id) && req.user.role !=="admin"){
            return res.ststus(403).json({message:"Not Authorized to Update checklist"})
        }

        task.todoChecklist = todoChecklist

        const completedCount = task.todoChecklist.filter(
            (item)=> item.completed
        ).length
        const totalItems = task.todoChecklist.length
        task.progress = totalItems > 0 ? Math.round((completedCount/totalItems)*100):0

        if(task.progress===100){
            task.status = "Completed"
        } else if(task.progress > 0){
            task.status = "In Progress"
        }else{
            task.status = "Pending"
        }

        await task.save()
        const updateTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )
        res.json({message:"Task checklist updated",task:updateTask})

    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const getDashboardData = async(req,res)=>{
    try {
        const totalTasks = await Task.countDocuments()
        const pendingTasks = await Task.countDocuments({status:"Pending"})
        const completedTasks = await Task.countDocuments({status:"Completed"})
        const overdueTasks = await Task.countDocuments({
            status:{$ne:"Completed"},
            dueDate:{$lt:new Date()},
        })

        const taskStatuses = ["Pending","In Progress", "Completed"]
        const taskDistributionRaw = await Task.aggregate([
            {
                $group:{
                    _id: "$status",
                    count : { $sum :1 },
                },
            },
        ])
        const taskDistribution= taskStatuses.reduce((acc,status)=>{
            const formattedKey = status.replace(/\s+/g,"")
            acc[formattedKey] = taskDistributionRaw.find((item)=>item._id ===status)?. count ||0
            return acc
        },{})
        taskDistribution["All"] = totalTasks

        const taskPriorities = ["Low","Medium","High"]
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $group:{
                    _id: "$priority",
                    count : { $sum :1 },
                },
            },
        ])
        const taskPriorityLevels = taskPriorities.reduce((acc,priority)=>{
            acc[priority]=taskPriorityLevelsRaw.find((item)=>item._id===priority)?.count ||0
            return acc
        },{})
        const recentTasks = await Task.find()
        .sort({createdAt:-1})
        .limit(10)
        .select("title status priority dueDate createdAt")

        res.status(200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts:{
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        })

    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

const getUserDashboardData = async(req,res)=>{
    try {
        const userId = req.user._id
        const totalTasks = await Task.countDocuments({assignedTo:userId})
        const pendingTasks = await Task.countDocuments({assignedTo:userId,status:"Pending"})
        const completedTasks = await Task.countDocuments({assignedTo:userId,status:"Completed"})
        const overdueTasks = await Task.countDocuments({
            assignedTo:userId,
            status:{$ne:"Completed"},
            dueDate:{$lt:new Date()},
        })

        const taskStatuses = ["Pending","In Progress", "Completed"]
        const taskDistributionRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {
                $group:{
                    _id: "$status",
                    count : { $sum :1 },
                },
            },
        ])
        const taskDistribution= taskStatuses.reduce((acc,status)=>{
            const formattedKey = status.replace(/\s+/g,"")
            acc[formattedKey] = taskDistributionRaw.find((item)=>item._id ===status)?. count ||0
            return acc
        },{})
        taskDistribution["All"] = totalTasks

        const taskPriorities = ["Low","Medium","High"]
        const taskPriorityLevelsRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {
                $group:{
                    _id: "$priority",
                    count : { $sum :1 },
                },
            },
        ])
        const taskPriorityLevels = taskPriorities.reduce((acc,priority)=>{
            acc[priority]=taskPriorityLevelsRaw.find((item)=>item._id===priority)?.count ||0
            return acc
        },{})
        const recentTasks = await Task.find({assignedTo:userId})
        .sort({createdAt:-1})
        .limit(10)
        .select("title status priority dueDate createdAt")

        res.status(200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts:{
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        })

    } catch (error) {
        res.status(500).json({message:"Server error",error:error.message})
    }
}

export {updateTask,deleteTask,getDashboardData,getTaskById,getTasks,createTask,updateTaskStatus,updateTaskChecklist,getUserDashboardData}