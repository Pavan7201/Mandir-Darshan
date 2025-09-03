import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import multer from "multer";

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

let usersCollection, blacklistedTokensCollection, assetsCollection;
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    usersCollection = db.collection("users");
    blacklistedTokensCollection = db.collection("blacklistedtokens");
    assetsCollection = db.collection("assets");

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
    const { firstName, middleName, lastName, mobile, password, gender } = req.body;
    if (!firstName || !lastName || !mobile || !password || !gender) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const existingMobile = await usersCollection.findOne({ mobile });
    if (existingMobile) return res.status(400).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { firstName, middleName, lastName, mobile, passwordHash, gender };

    const { insertedId } = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { _id: insertedId.toString(), firstName, mobile, gender },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: { _id: insertedId.toString(), firstName, middleName, lastName, mobile, gender },
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
      { _id: user._id.toString(), firstName: user.firstName, mobile: user.mobile, gender: user.gender },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        mobile: user.mobile,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/api/admin/login", async (req, res) => {
  try {
    const { userId, passcode } = req.body;
    if (!userId || !passcode || passcode.length !== 6) {
      return res.status(400).json({ error: "UserId and 6-digit passcode required" });
    }

    const adminUser = await usersCollection.findOne({ userId, isAdmin: true });
    if (!adminUser) {
      return res.status(401).json({ error: "Invalid UserID or Passcode" });
    }

    const passcodeMatches = await bcrypt.compare(passcode, adminUser.passcodeHash);
    if (!passcodeMatches) {
      return res.status(401).json({ error: "Invalid UserID or Passcode" });
    }
    
    const token = jwt.sign(
      { _id: adminUser._id.toString(), userId: adminUser.userId, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        _id: adminUser._id.toString(),
        userId: adminUser.userId,
        firstName: adminUser.firstName,
        role: "admin"
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/editprofile", authenticateUserMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    const {
      firstName,
      middleName,
      lastName,
      mobile,
      gender,
      currentPassword,
      newPassword,
      removeAvatar 
    } = req.body;

    const user = await usersCollection.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName.trim();
    if (middleName) updateFields.middleName = middleName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (mobile) updateFields.mobile = mobile.trim();
    if (gender) updateFields.gender = gender;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      updateFields.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      updateFields.avatar = req.file.buffer;
      updateFields.avatarType = req.file.mimetype;
    } else if (removeAvatar === "true" || removeAvatar === true) {
      updateFields.avatar = null;
      updateFields.avatarType = null;
    }

    await usersCollection.updateOne({ _id: userId }, { $set: updateFields });

    const updatedUser = await usersCollection.findOne({ _id: userId }, { projection: { passwordHash: 0 } });

    let avatarBase64 = null;
    if (updatedUser.avatar && updatedUser.avatarType) {
      avatarBase64 = `data:${updatedUser.avatarType};base64,${updatedUser.avatar.toString("base64")}`;
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        avatar: avatarBase64,
      },
    });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ error: "Server error updating profile" });
  }
});

app.post("/api/logout", authenticateUserMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

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

    let avatarBase64 = null;
    if (user.avatar && user.avatarType) {
      avatarBase64 = `data:${user.avatarType};base64,${user.avatar.toString("base64")}`;
    }

    res.json({ user: { ...user, avatar: avatarBase64 } });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/delete-account", authenticateUserMiddleware, async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    await usersCollection.deleteOne({ _id: userId });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete-account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.get("/api/assets", async (_req, res) => {
  try {
    const assets = await assetsCollection.find().toArray();
    res.json(assets);
  } catch (err) {
    console.error("Get assets error:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

app.put("/api/assets/temple/:id/image", authenticateUserMiddleware, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "New image URL is required." });
    }
    
    const templeDocument = await assetsCollection.findOne({ category: "temple" });
    if (!templeDocument) {
      return res.status(404).json({ error: "Temple category document not found" });
    }

    const itemIndex = templeDocument.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Temple item not found" });
    }
    templeDocument.items[itemIndex].image = image.trim();

    await assetsCollection.updateOne(
      { _id: templeDocument._id },
      { $set: { items: templeDocument.items } }
    );

    res.json({
      message: "Temple image updated successfully",
      updatedItem: templeDocument.items[itemIndex],
    });
  } catch (err) {
    console.error("Error updating temple image:", err);
    res.status(500).json({ error: "Failed to update temple image" });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
