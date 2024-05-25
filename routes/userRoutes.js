import express from "express";
import { login, logout, register, forgotPassword, resetPassword, getUserById, getAllUsers, updateUserIsAdminStatus  } from "../controllers/usercontroller.js";
import { verifyToken } from "../middlewares/verify-token.js";

const userRoutes = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/logout", logout);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", resetPassword);
userRoutes.get('/data/:userId', verifyToken,getUserById);
userRoutes.get('/all', verifyToken,getAllUsers);
userRoutes.put('/:userId', verifyToken,updateUserIsAdminStatus);

export default userRoutes;
