const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db/db");
const userRoutes = require("./routes/user.routes");

const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

module.exports = app;
