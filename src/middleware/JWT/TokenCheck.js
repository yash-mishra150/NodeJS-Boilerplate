const { generateAccessToken, decodeToken } = require("./JWT");
const logger = require("../Logging/Logger");
const { logout } = require("./BlackListingTokens");

const tokenCheckRoute = async (req, res) => {
  const accesstoken = req.cookies.accessToken;
  const refreshtoken = req.cookies.refreshToken;


  // console.log('Access Token:', accesstoken);
  // console.log('Refresh Token:', refreshtoken);



  try {
    if (!accesstoken || !refreshtoken) {
      logger.error(
        "Missing tokens: Access token or refresh token is not found."
      );
      return res.status(401).json({ message: "Missing important credentials" });
    }

    const decodedAccessToken = await decodeToken(accesstoken);
    const decodedRefreshToken = await decodeToken(refreshtoken);

    if (!decodedAccessToken || !decodedRefreshToken) {
      logger.error("Token decoding failed: Invalid access or refresh token.");
      return res.status(401).json({ message: "Invalid tokens" });
    }

    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedAccessToken.exp < currentTime) {
      logger.warn("Access token expired.");

      if (decodedRefreshToken.exp >= currentTime) {
        const newAccessToken = await generateAccessToken(refreshtoken, res);
        logger.info(
          "Access token expired, new access token issued using refresh token."
        );
        return res.status(200).json({ accessToken: newAccessToken });
      }

      logger.warn("Both access and refresh tokens are expired.");
      await logout(req, res);
      return res
        .status(401)
        .json({ message: "Tokens expired, please log in again" });
    }

    if (decodedRefreshToken.exp < currentTime) {
      logger.warn("Refresh token expired.");
      await logout(req, res);
      return res
        .status(401)
        .json({ message: "Refresh token expired, please log in again" });
    }

    return res.status(200).json({ message: "Tokens are valid" });
  } catch (error) {
    logger.error("Error validating tokens", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { tokenCheckRoute };
