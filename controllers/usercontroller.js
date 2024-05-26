import dotenv from 'dotenv';
import userModel from "../models/userModel.js";
import { createTokens } from "../utils/create-token.js";
import { Cypher, Decypher } from "../utils/cypher-decypher.js";
import crypto from 'crypto';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;

import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

import nodemailer from "nodemailer";


dotenv.config();

const secretKey = process.env.ENCRYPTING_SECRET_KEY;
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};


export const register = async (req, res) => {
  try {
    const { username, password: encryptedPassword, email } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is mandatory" });
    }
    if (!encryptedPassword) {
      return res.status(400).json({ success: false, message: "Password is mandatory" });
    }

    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    const password = bytes.toString(CryptoJS.enc.Utf8);

    const findUser = await userModel.findOne({ username, email });

    if (findUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = await userModel.create({ username, password: Cypher(password), email });

    const { accessToken, refreshToken } = createTokens({ id: newUser._id });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure only in production
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 2,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure only in production
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    const { password: userPassword, ...userData } = newUser._doc;

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

   
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return the user data
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const login = async (req, res) => {
  try {
    const { username, password: encryptedPassword } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Error! Invalid username" });
    }
    if (!encryptedPassword) {
      return res.status(400).json({ success: false, message: "Error! Invalid password" });
    }

    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    const password = bytes.toString(CryptoJS.enc.Utf8);

    const findUser = await userModel.findOne({ username });

    if (!findUser) {
      return res.status(400).json({ success: false, message: "User not found, kindly register" });
    }

    if (!Decypher(password, findUser.password)) {
      return res.status(400).json({ success: false, message: "Error! Invalid password" });
    }

    const { accessToken, refreshToken } = createTokens({ id: findUser._id });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure only in production
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 2,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure only in production
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.status(200).json({ success: true, user: findUser });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
};


export const logout = async (req, res) =>{
  try {
    const cookiesToClear = ["accessToken", "refreshToken"];
    cookiesToClear.forEach((cookie) => {
      res.clearCookie(cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        path: "/",
      });
      console.log(`Cleared cookie: ${cookie}`);
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json({ success: false, error });
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Configure Nodemailer transporter with environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with your email service provider (e.g., 'gmail', 'outlook')
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // // Create JWT payload with user ID and reset token
    // const payload = { id: user._id, token: resetToken };
    const resetLink = `https://localhost:3000/reset?token=${resetToken}`;

    console.log(`Password reset link: ${resetLink}`);
    res.status(200).json({ success: true, message: 'Password reset link generated (check console for details)' });

    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Password Reset Request',
      html:  `
      <p>You requested a password reset for your account. Please click on the following link to set a new password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request a password reset, please ignore this email and your password remains unchanged.</p>
    `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error sending email' });
      }
      res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { token:token, password: encryptedPassword } = req.body;

  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Ensure token has not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    const passwords = bytes.toString(CryptoJS.enc.Utf8);

    user.password = Cypher(passwords);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users from the database
    const users = await userModel.find();

    // Return the list of users
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUserIsAdminStatus = async (req, res) => {
  const userId = req.params.userId;

  // Check if user ID is present
  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  try {
    const user = await userModel.findById(userId); // Find user by ID

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's isAdmin status (assuming you have logic here)
    user.isAdmin = !user.isAdmin;
    await user.save();

    // Success response
    res.status(200).json({ message: 'User isAdmin status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
