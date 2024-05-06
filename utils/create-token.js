import jwt from "jsonwebtoken";

export function createTokens(payload) {
  let accessToken, refreshToken;

  try {
    accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 1000 * 60 * 2,
    });

    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: 1000 * 60 * 60 * 24 * 365,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error: ", error);
  }
}