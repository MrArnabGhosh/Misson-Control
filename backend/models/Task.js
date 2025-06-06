import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema({ 
    text:{type:String,required:true},
    complete:{type:Boolean,default:false},
}
)

const taskSchema = new Schema({
    title:{type:String,required:true},
    description:{type:string},
    priority:{type:string,enum:["Low","Medium","High"],default:Medium},
    status:{type:string,enum:["Pending","In Progress","Complete"],default:"Pending"},
    dueDate:{type:Date,required:true},
    assignedTo:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    attachments:[{type:string}],
    todoChecklist:[todoSchema],
    progress:{type:Number,default:0},
},{timestamps:true}
)
export const task = mongoose.model("Task",taskSchema )