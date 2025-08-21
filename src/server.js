import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "";
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, 
  })
);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  mobile: { type: String, unique: true },
  passwordHash: String,
});
const User = mongoose.model("User", UserSchema);

const BlacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
const BlacklistedToken = mongoose.models.BlacklistedToken || mongoose.model("BlacklistedToken", BlacklistedTokenSchema);

const authenticateUserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) return res.status(401).json({ error: "Token has been invalidated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 3600000, 
};

app.get("/", (req, res) => res.send("Backend is running 🚀"));

app.post("/api/signUp", async (req, res) => {
  try {
    const { firstName, middleName, lastName, mobile, password } = req.body;
    if (!firstName || !lastName || !mobile || !password)
      return res.status(400).json({ error: "All required fields must be filled." });

    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ firstName, middleName, lastName, mobile, passwordHash });
    await user.save();

    const token = jwt.sign({ _id: user._id, firstName: user.firstName }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User created",
      user: { _id: user._id, firstName, middleName, lastName, mobile },
      redirect: "/",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: "Mobile and password required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    await BlacklistedToken.deleteMany({ userId: user._id });

    const token = jwt.sign({ _id: user._id, firstName: user.firstName }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, cookieOptions);

    res.json({
      message: "Login successful",
      user: { _id: user._id, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName, mobile: user.mobile },
      redirect: "/",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/logout", authenticateUserMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded._id) {
        const expiry = decoded.exp ? new Date(decoded.exp * 1000) : new Date();
        await BlacklistedToken.create({ token, userId: decoded._id, expiresAt: expiry });
      }
    }
    res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
    res.json({ message: "Logged out successfully", redirect: "/login" });
  } catch {
    res.status(500).json({ error: "Logout failed", redirect: "/login" });
  }
});

app.get("/api/me", authenticateUserMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) return res.status(404).json({ error: "User not found", redirect: "/signup" });

    const token = req.cookies?.token;
    if (token && req.user?._id) {
      const expiry = req.user.exp ? new Date(req.user.exp * 1000) : new Date();
      await BlacklistedToken.create({ token, userId: req.user._id, expiresAt: expiry });
    }

    await BlacklistedToken.deleteMany({ userId: req.user._id });

    res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
    res.json({ message: "Account deleted successfully", redirect: "/signup" });
  } catch (err) {
    console.error("❌ Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account", redirect: "/signup" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
