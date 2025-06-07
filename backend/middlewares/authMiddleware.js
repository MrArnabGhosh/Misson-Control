import User  from "../models/User.js"
import jwt from "jsonwebtoken"

const protect = async(req,res,next)=>{
    try {
        let token = req.headers.authorization;
        if(token && token.startWith("Bearer")){
            token = token.split(" ")[1];
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            req.user =await User.findById(decoded.id).select("-password")
            next()
        }else{
            res.status(401).json({message:"Not Authorized"})
        }
    } catch (error) {
        res.status(401).json({message:"Token faild",error:error.message})
    }
}

const adminOnly = (req,res,next)=>{
    if (req.user && req.user.role==="admin") {
        next()
    } else {
        res.status(403).json({message:"Access Denied , Admin only"})
    }
}

export {protect,adminOnly}