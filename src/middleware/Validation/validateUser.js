const logger = require("../Logging/Logger");
const validator = require("validator");

const allowedQueries = {
  name: /^[^\d]+$/,
  email: /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com)$/i,
  phone: /^\d{10}$/,
  password: /^(?=.*[@_])[a-zA-Z0-9@_]{6,}$/,
  recaptchaToken: /^[A-Za-z0-9_-]+$/,
};

const validate = async (req, res, next) => {
  try {
    const { body } = req;

    for (const [key, value] of Object.entries(body)) {
      if (!allowedQueries[key]) {
        return res.status(400).json({
          message: `Invalid field: ${key} is not allowed.`,
          code: "INVALID_FIELD",
        });
      }

      const regex = allowedQueries[key];
      if (value && !regex.test(value)) {
        return res.status(400).json({
          message: `Invalid ${key} format.`,
          code: `INVALID_${key.toUpperCase()}_FORMAT`,
        });
      }

      if (typeof value === "string") {
        body[key] = validator.escape(validator.trim(value));
      }
    }

    req.body = body;
    next();
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      code: "INTERNAL_ERROR",
    });
  }
};

module.exports = validate;
