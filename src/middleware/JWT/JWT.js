const path = require("path");
const fs = require("fs");
const util = require("util");
const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");

const readFileAsync = util.promisify(fs.readFile);

const privateKeyPath = path.join(__dirname, "../../../keys/private.pem");
const publicKeyPath = path.join(__dirname, "../../../keys/public.pem");

async function readPrivateKey() {
  try {
    return await readFileAsync(privateKeyPath, "utf8");
  } catch (error) {
    throw new Error("Unable to read private key");
  }
}

async function readPublicKey() {
  try {
    return await readFileAsync(publicKeyPath, "utf8");
  } catch (error) {
    throw new Error("Unable to read public key");
  }
}

async function generateAccessToken(refreshtoken, res) {
  try {
    const privateKey = await readPrivateKey();

    const decodedRefreshToken = jwt.verify(refreshtoken, privateKey, {
      algorithms: ["RS256"],
    });

    if (!decodedRefreshToken) {
      logger.error("Invalid refresh token");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { ...decodedRefreshToken, type: "access" },
      privateKey,
      { algorithm: "RS256", expiresIn: "1h" }
    );

    const accessTokenCookie = serialize("accessToken", accessToken, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.setHeader("Set-Cookie", accessTokenCookie);

    logger.info("New access token generated and sent.");

    return accessToken;
  } catch (error) {
    logger.error("Error generating new access token", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function encodeTokens(payload, res) {
  console.log("inside token");

  try {
    const privateKey = await readPrivateKey(); 


    const accessToken = jwt.sign({ ...payload, type: "access" }, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
    });


    const refreshToken = jwt.sign({ ...payload, type: "refresh" }, privateKey, {
      algorithm: "RS256",
      expiresIn: "24h",
    });


    const isProduction = process.env.NODE_ENV === "production";


    res.cookie("accessToken", accessToken, {
      path: "/",
      maxAge: 60 * 60 * 1000, 
      httpOnly: true,
      secure: isProduction, 
      sameSite: "None",
    });


    res.cookie("refreshToken", refreshToken, {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: isProduction,
      sameSite: "None",
    });

    console.log("Cookies set successfully");

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error encoding tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function decodeToken(token) {
  const publicKey = await readPublicKey();

  try {
    return jwt.verify(token, publicKey);
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

module.exports = {
  encodeTokens,
  decodeToken,
  generateAccessToken,
};
