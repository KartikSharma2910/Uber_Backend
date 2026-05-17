const captainModel = require("../models/captain.model");
const blackListTokenModel = require("../models/blackListToken.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");

const registerCaptain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
      phoneNumber,
      vehicle,
    } = req.body;

    const existingCaptain = await captainModel.findOne({ email });
    if (existingCaptain) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const newCaptain = await captainService.createCaptain({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    res.status(201).json({
      message: "Captain registered successfully",
      captain: newCaptain,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering captain", error: error.message });
  }
};

const loginCaptain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = captain.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: "Captain logged in successfully",
      token,
      captain: {
        _id: captain._id,
        fullName: captain.fullName,
        email: captain.email,
        vehicle: captain.vehicle,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in captain", error: error.message });
  }
};

const getCaptainProfile = async (req, res) => {
  try {
    const captain = await captainModel
      .findById(req.captain._id)
      .select("-password");
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }
    res.json({ captain });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching captain profile",
      error: error.message,
    });
  }
};

const logoutCaptain = async (req, res) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (token) {
    await blackListTokenModel.create({ token });
  }

  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

module.exports = {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  logoutCaptain,
};
