const userModel = require("../models/user.model");

module.exports.createUser = async ({
  firstName,
  lastName,
  email,
  password,
  socketId,
}) => {
  if (!firstName || !email || !password) {
    throw new Error("All fields are required");
  }
  return await userModel.create({
    fullName: { firstName, lastName },
    email,
    password,
    socketId,
  });
};
