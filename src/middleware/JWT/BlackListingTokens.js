const { decodeToken } = require("./JWT");
const { connectDB } = require("../../config/database");
const logger = require("../Logging/Logger");

async function checkIfTokenBlacklisted(req, res, next) {
  const accesstoken = req.cookies.accessToken;
  const refreshtoken = req.cookies.refreshToken;

  try {
    logger.info("Checking if tokens are blacklisted", {
      method: req.method,
      url: req.originalUrl,
      hasAccessToken: Boolean(accesstoken),
      hasRefreshToken: Boolean(refreshtoken),
    });

    const db = await connectDB();
    const collection = db.collection("blacklist");

    const blacklistedaccessToken = await collection.findOne({ accesstoken });
    const blacklistedrefreshToken = await collection.findOne({ refreshtoken });

    if (blacklistedaccessToken || blacklistedrefreshToken) {
      logger.warn("Blacklisted token found", {
        method: req.method,
        url: req.originalUrl,
        blacklistedAccessToken: Boolean(blacklistedaccessToken),
        blacklistedRefreshToken: Boolean(blacklistedrefreshToken),
      });

      return res.status(403).json({ message: "Token has been blacklisted" });
    }

    logger.info("Tokens are not blacklisted", {
      method: req.method,
      url: req.originalUrl,
      hasAccessToken: Boolean(accesstoken),
      hasRefreshToken: Boolean(refreshtoken),
    });

    next();
  } catch (error) {
    logger.error("Error occurred during token validation", {
      errorMessage: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
    });

    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function blacklistToken(token) {
  try {
    const decodedtoken = await decodeToken(token);

    if (!decodedtoken) {
      throw new Error("Invalid token");
    }

    const db = await connectDB();
    const collection = db.collection("blacklist");

    await collection.insertOne({
      token,
      createdAt: new Date(),
      exp: decodedtoken.exp,
    });

    logger.warn("Token blacklisted:", token);
  } catch (error) {
    logger.error("Error blacklisting token", error);
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  if (!refreshToken || !accessToken) {
    return res.status(400).json({ message: "Already Loged out" });
  }

  await blacklistToken(refreshToken);
  await blacklistToken(accessToken);

  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "None",
  });

  res.clearCookie("refreshToken", {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "None", 
  });

  return res.status(200).json({ message: "Logged out successfully" });
}

async function createTTLIndex() {
  try {
    const db = await connectDB();
    const collection = db.collection("blacklist");

    await collection.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });

    logger.info("TTL index created successfully.");
  } catch (error) {
    logger.error("Error creating TTL index", error);
  }
}

createTTLIndex();

module.exports = {
  checkIfTokenBlacklisted,
  blacklistToken,
  logout,
};
