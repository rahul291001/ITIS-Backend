import userModel from "../models/userModel.js";
import { createTokens } from "../utils/create-token.js";
import { Cypher, Decypher } from "../utils/cypher-decypher.js";

export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is mandatory" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is mandatory" });
    }

    const findUser = await userModel.findOne({
      username,
      email,
    });

    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const newUser = await userModel.create({
      username,
      password: Cypher(password),
      email,
    });

    const { accessToken, refreshToken } = createTokens({
      id: newUser._id,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 2,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    const { password: userPassword, ...userData } = newUser._doc;

    res.status(200).json({success:true,userData});
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Error! invalid username" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Error! invalid password" });
    }

    const findUser = await userModel.findOne({
      username,
    });

    if (!findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found, kindly register" });
    }

    if (!Decypher(password, findUser.password)) {
      return res
        .status(400)
        .json({ success: false, message: "Error! invalid password" });
    }

    const { accessToken, refreshToken } = createTokens({
      id: findUser._id,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 2,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    

    res.status(200).json({ success: true, user: findUser });
  } catch (error) {
    console.log("error: ", error);
  }
};

export const logout = async (req, res) => {
  try {
    const cookiesToClear = ["accessToken", "refreshToken"];
    cookiesToClear.forEach((cookie) => {
      res.clearCookie(cookie);
    });

    res.status(200).json({ success: true, message: "Logged out successfull" });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
};