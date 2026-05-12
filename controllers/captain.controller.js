const captainModel = require("../models/captain.model");
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

module.exports = {
  registerCaptain,
};
