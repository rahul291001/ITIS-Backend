import jwt from "jsonwebtoken";
import { createTokens } from "../utils/create-token.js";

export let verifyToken = async (req, res, next) => {
  let accessToken, refreshToken;
  try {
    accessToken = req.cookies["accessToken"];
    refreshToken = req.cookies["refreshToken"];
    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "No token found" });
    }
    if (accessToken) {
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decode) => {
          if (error) {
            return res.status(401).json({ message: "Invalid token" });
          }
          req.userId = decode.id;

          console.log('User ID:', req.userId);
          next();
        }
      );
    }
    if (!accessToken && refreshToken) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, decode) => {
          if (error) {
            console.log("error: ", error);
            return res.status(401).json({ message: "Invalid token" });
          }
          const { accessToken, refreshToken } = createTokens({ id: decode.id });
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 2,
            sameSite: "strict",
            path: "/",
          });
          res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            sameSite: "strict",
            path: "/",
          });
          req.userId = decode.id;
          next();
        }
      );
    }
  } catch (error) {
    res.status(400).json({ message: "Not authorised, token not found" });
    console.log("error: ", error);
  }
};