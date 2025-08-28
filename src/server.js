import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "test";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

let usersCollection, blacklistedTokensCollection, assetsCollection, templeDataCollection;
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    usersCollection = db.collection("users");
    blacklistedTokensCollection = db.collection("blacklistedtokens");
    assetsCollection = db.collection("assets");
    templeDataCollection = db.collection("TemplesData");

    await blacklistedTokensCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();
 
// const getCookieOptions = () => ({ //for development and testing
//   httpOnly: true,
//   secure: true,
//   sameSite: "lax",
//   path: "/",
// });

// const getCookieOptions = () => ({
//   httpOnly: true,
//   secure: true,     
//   sameSite: "none",
//   path: "/",
// });

const authenticateUserMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.substring(7);
    const blacklisted = await blacklistedTokensCollection.findOne({ token });
    if (blacklisted)
      return res.status(401).json({ error: "Token has been invalidated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.get("/", (_req, res) => res.send("Backend is running 🚀"));

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, middleName, lastName, mobile, password } = req.body;
    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const existingMobile = await usersCollection.findOne({ mobile });
    if (existingMobile) return res.status(400).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { firstName, middleName, lastName, mobile, passwordHash };

    const { insertedId } = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { _id: insertedId.toString(), firstName, mobile },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message: "User created",
      token,
      user: { _id: insertedId.toString(), firstName, middleName, lastName, mobile },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res.status(400).json({ error: "Mobile and password required" });

    const user = await usersCollection.findOne({ mobile });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    await blacklistedTokensCollection.deleteMany({ userId: user._id });

    const token = jwt.sign(
      { _id: user._id.toString(), firstName: user.firstName, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    // res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/logout", authenticateUserMiddleware, async (req, res) => {
  try {
    // const token = req.cookies.token;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.exp && decoded?._id) {
        await blacklistedTokensCollection.insertOne({
          token,
          userId: new ObjectId(decoded._id),
          expiresAt: new Date(decoded.exp * 1000),
        });
      }
    }
    // res.cookie("token", "", {...getCookieOptions(), expires: new Date(0)});
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/api/me", authenticateUserMiddleware, async (req, res) => {
  try {
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.log("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);

    await usersCollection.deleteOne({ _id: userId });

    // res.cookie("token", "", {...getCookieOptions(), expires: new Date(0)});

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.log("Delete-account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.get("/api/assets", async (_req, res) => {
  try{
    const assets = await assetsCollection.find().toArray();
    res.json(assets);
  }catch (err) {
    console.log("Get assets error:", err);
    res.status(500).json({error: "Failed to fetch assets"})
  }
})

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
