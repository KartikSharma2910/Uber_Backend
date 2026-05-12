const userModel = require("../models/user.model");
const blackListTokenModel = require("../models/blackListToken.model");
const { validationResult } = require("express-validator");
const userService = require("../services/user.service");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const {
    fullName: { firstName, lastName },
    email,
    password,
    socketId,
  } = req.body;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await userModel.hashPassword(password);

  try {
    const user = await userService.createUser({
      email,
      firstName,
      lastName,
      socketId,
      password: hashedPassword,
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        socketId: user.socketId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = user.generateAuthToken();
    res.cookie("token", token);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        socketId: user.socketId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      socketId: user.socketId,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  await blackListTokenModel.create({ token });
  res.json({ message: "Logout successful" });
};

module.exports = { registerUser, loginUser, getUserProfile, logoutUser };
