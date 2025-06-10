import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User.js"



const generateToken =(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET, {expiresIn:"7d"})
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let role = "member";
    // Check for admin invite token
    if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      role = "admin";
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    // If user creation is successful, send back user data and a token
    if (user) {
      res.status(201).json({
        _id: user._id, // Fixed typo here
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl, // Consistent casing
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data provided" });
    }
  } catch (error) {
    console.error("Error during user registration:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const loginUser = async (req,res)=>{
     try {
        const {email,password} = req.body

        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message:"Invalid email and password"})
        }

        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({message:"Invalid email and password"})
        }
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id)
       })
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message})
    }
}

const getUserProfile = async (req,res)=>{
     try {
        const user = await User.findById(req.user.id).select(-password)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.json(user)

    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message})
    }
}

const updateUserProfile = async(req,res)=>{
     try {
        const user = await User.findById(req.user.id)
        if(!user){
            return res.status(404).json({meassage:"user not found"})
        }

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email

        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password,salt)
        }
        const updateUser = await user.save()
        res.json({
            _id:updateUser._id,
            name:updateUser.name,
            email:updateUser.email,
            role:updateUser.role,
            token:generateToken(updateUser._id)
        })
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message})
    }
}

export {registerUser,loginUser,getUserProfile,updateUserProfile}