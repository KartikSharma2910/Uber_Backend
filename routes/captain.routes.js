const express = require("express");
const router = express.Router();
const {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  logoutCaptain,
} = require("../controllers/captain.controller");
const { authCaptainMiddleware } = require("../middlewares/auth.middleware");
const { body } = require("express-validator");

router.post(
  "/register",
  [
    body("fullName.firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isString()
      .withMessage("First name must be a string"),
    body("fullName.lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .isString()
      .withMessage("Last name must be a string"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color")
      .isLength({ min: 1 })
      .withMessage("Vehicle color is required"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Vehicle license plate is required"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Vehicle capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "motorcycle", "auto"])
      .withMessage("Vehicle type is required"),
  ],
  registerCaptain,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  loginCaptain,
);

router.get("/profile", authCaptainMiddleware, getCaptainProfile);
router.post("/logout", authCaptainMiddleware, logoutCaptain);

module.exports = router;
