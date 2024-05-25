import express from "express";
import { login, logout, register, forgotPassword, resetPassword } from "../controllers/usercontroller.js";

const userRoutes = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/logout", logout);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", resetPassword);

export default userRoutes;
