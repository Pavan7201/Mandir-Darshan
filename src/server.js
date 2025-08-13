import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import BlacklistedToken from "./models/BlacklistedToken.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "";
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`Blocked CORS request from: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
);

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  mobile: { type: String, unique: true },
  passwordHash: String
});
const User = mongoose.model("User", UserSchema);

const authenticateUserMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const blacklisted = await BlacklistedToken.findOne({ token });
  if (blacklisted) return res.status(401).json({ error: "Token has been invalidated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, middleName, lastName, mobile, password } = req.body;
    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ error: "User already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ firstName, middleName, lastName, mobile, passwordHash });
    await user.save();
    const token = jwt.sign({ id: user._id, firstName: user.firstName }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/", 
      maxAge: 3600000
    });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile and password are required" });
    }
    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, firstName: user.firstName }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",    
      maxAge: 3600000
    });
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/logout", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.decode(token);
    const expiry = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (!blacklisted) {
      await BlacklistedToken.create({ token, expiresAt: expiry });
    }
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/"
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/api/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const blacklisted = await BlacklistedToken.findOne({ token });
  if (blacklisted) return res.status(401).json({ error: "Token has been invalidated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.decode(token);
      const expiry = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
      const blacklisted = await BlacklistedToken.findOne({ token });
      if (!blacklisted) {
        await BlacklistedToken.create({ token, expiresAt: expiry });
      }
    }
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/"
    });
    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.log("Deleting account error: ", err);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
