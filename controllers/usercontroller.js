import dotenv from 'dotenv';
import userModel from "../models/userModel.js";
import { createTokens } from "../utils/create-token.js";
import { Cypher, Decypher } from "../utils/cypher-decypher.js";
import CryptoJS from "crypto-js";

dotenv.config();

const secretKey = process.env.ENCRYPTING_SECRET_KEY;

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
