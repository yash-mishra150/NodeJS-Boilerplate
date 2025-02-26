const express = require("express");
const { createUser, loginUsers } = require("../controllers/userController");
const { tokenCheckRoute } = require("../middleware/JWT/TokenCheck");

const router = express.Router();

router.post("/users/login", loginUsers);
router.post("/users/register", createUser);
router.get("/test", tokenCheckRoute, (req, res) => {
  console.log("ok");
});

module.exports = router;
