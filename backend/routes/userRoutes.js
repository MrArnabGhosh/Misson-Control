import express from "express"
import { adminOnly, protect } from "../middlewares/authMiddleware.js"
import { getUserById, getUsers } from "../controllers/userController.js"

const router= express.Router()

router.get("/",protect,adminOnly,getUsers)
router.get("/:id",protect,getUserById)
// router.delete("/:id",adminOnly,deleteUser)

export default router