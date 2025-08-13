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
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const TOKEN_EXPIRY_SECONDS = 3600;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: TOKEN_EXPIRY_SECONDS * 1000
};

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin) return callback(null, true);

      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error(`CORS policy: Origin ${incomingOrigin} not allowed`)
        );
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
);

app.options("*", cors());
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

    const token = jwt.sign(
      { id: user._id, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY_SECONDS }
    );

    res.cookie("token", token, { ...cookieOptions });

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

    const token = jwt.sign(
      { id: user._id, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY_SECONDS }
    );

    res.cookie("token", token, { ...cookieOptions });

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

app.post("/api/logout", authenticateUserMiddleware, async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      const expiry = new Date(decoded.exp * 1000);
      await BlacklistedToken.create({ token, expiresAt: expiry });
    }
  }
  res.clearCookie("token", { ...cookieOptions });
  res.json({ message: "Logged out successfully" });
});

app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        const expiry = new Date(decoded.exp * 1000);
        await BlacklistedToken.create({ token, expiresAt: expiry });
      }
    }
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token", { ...cookieOptions });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Deleting account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});


app.get("/api/me", authenticateUserMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
