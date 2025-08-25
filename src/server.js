import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", true); // required for Render behind a proxy

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "";
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        // Exact origin must be set, not *
        return callback(null, origin);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);


// MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------- Schemas --------------------
const UserSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  mobile: { type: String, unique: true },
  passwordHash: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const BlacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 3600 } }, // TTL = 1h
});

const BlacklistedToken =
  mongoose.models.BlacklistedToken || mongoose.model("BlacklistedToken", BlacklistedTokenSchema);

// -------------------- Middleware --------------------
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

// -------------------- Cookie Options --------------------
const getCookieOptions = (req) => {
  const origin = req.headers.origin;
  const isLocalhost = origin?.includes("localhost");

  return {
    httpOnly: true,
    secure: !isLocalhost, // true for production HTTPS
    sameSite: isLocalhost ? "lax" : "none", // none for cross-origin
    path: "/",
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1h
  };
};

// -------------------- Routes --------------------
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, middleName, lastName, mobile, password } = req.body;
    if (!firstName || !lastName || !mobile || !password)
      return res.status(400).json({ error: "All required fields must be filled." });

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) return res.status(400).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ firstName, middleName, lastName, mobile, passwordHash });
    await user.save();

    const token = jwt.sign({ _id: user._id, firstName: user.firstName, mobile: user.mobile }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, getCookieOptions(req));

    res.status(201).json({
      message: "User created",
      user: { _id: user._id, firstName, middleName, lastName, mobile },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: "Mobile and password required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    await BlacklistedToken.deleteMany({ userId: user._id });

    const token = jwt.sign({ _id: user._id, firstName: user.firstName, mobile: user.mobile }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, getCookieOptions(req));

    res.json({
      message: "Login successful",
      user: { _id: user._id, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName, mobile: user.mobile },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout
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
    res.cookie("token", "", { ...getCookieOptions(req), maxAge: 0 });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Get current user
app.get("/api/me", authenticateUserMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete account
app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    await BlacklistedToken.deleteMany({ userId: req.user._id });

    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded) {
        const expiry = decoded.exp ? new Date(decoded.exp * 1000) : new Date();
        await BlacklistedToken.create({ token, userId: decoded._id, expiresAt: expiry });
      }
    }

    res.cookie("token", "", { ...getCookieOptions(req), maxAge: 0 });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
