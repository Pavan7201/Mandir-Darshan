import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import multer from "multer";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "test";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

const N8N_WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_EMAIL_URL || "";
const N8N_WEBHOOK_MOBILE_URL = process.env.REACT_APP_WEBHOOK_MOBILE_URL || "";
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES);
const OTP_LENGTH = Number(process.env.OTP_LENGTH);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS);

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

let usersCollection, blacklistedTokensCollection, assetsCollection, emailOtpsCollection, mobileOtpsCollection, ticketsCollection, bookingsCollection;
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    usersCollection = db.collection("users");
    blacklistedTokensCollection = db.collection("blacklistedtokens");
    assetsCollection = db.collection("assets");
    emailOtpsCollection = db.collection("emailotps");
    mobileOtpsCollection = db.collection("mobileotps");
    ticketsCollection = db.collection("tickets");
    bookingsCollection = db.collection("bookings");
    await blacklistedTokensCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await emailOtpsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await mobileOtpsCollection.createIndex({expiresAt: 1}, {expireAfterSeconds : 0});
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

function escapeRegexSafe(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidEmailSimple(email = "") {
  return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

function generateNumericOtp(length = 6) {
  const max = 10 ** length;
  const num = Math.floor(Math.random() * (max - 10 ** (length - 1))) + 10 ** (length - 1);
  return String(num).slice(0, length);
}

function formatDateForDisplay(date) {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    }).format(date).replace(',', '');
}

async function fireN8nWebhook(webhookUrl, payload) {
  if (!webhookUrl) {
    console.error("❌ CRITICAL: The specific n8n Webhook URL is not defined in your .env file!");
    return;
  }

  console.log("--- Firing n8n Webhook ---");
  console.log("Payload Sent (ExpiresAt shown in IST):", {
    ...payload,
    expiresAt: formatDateForDisplay(new Date(payload.expiresAt)),
    });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.headers.get("content-type")?.includes("application/json")) {
        const responseBody = await response.json();
        if (!response.ok) {
            console.error("n8n workflow returned an error:", responseBody);
        } else {
            console.log("✅ Successfully sent data to n8n webhook (JSON response).");
        }
    } else {
        const textResponse = await response.text();
        if (!response.ok) {
            console.error("n8n workflow returned a non-JSON error:", textResponse);
        } else {
            console.log("✅ Successfully sent data to n8n webhook (non-JSON response).");
        }
    }
  } catch (err) {
    console.error("❌ FAILED to call n8n webhook. Error:", err.message || err);
  }
}

const authenticateUserMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ error: "Unauthorized" });
        const token = authHeader.substring(7);
        const blacklisted = await blacklistedTokensCollection.findOne({ token });
        if (blacklisted) return res.status(401).json({ error: "Token has been invalidated" });
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

app.get("/", (_req, res) => res.send("Backend is running 🚀"));

app.post("/api/signup", async (req, res) => {
    try {
        const { firstName, middleName, lastName, mobile, password, gender, email } = req.body;
        if (!firstName || !lastName || !mobile || !password || !gender || !email)
            return res.status(400).json({ error: "All required fields must be filled." });
        if (!isValidEmailSimple(email)) return res.status(400).json({ error: "Invalid email." });
        const existingMobile = await usersCollection.findOne({ mobile });
        if (existingMobile) return res.status(400).json({ error: "Mobile number already exists" });
        const existingEmail = await usersCollection.findOne({ email: email.toLowerCase() });
        if (existingEmail) return res.status(400).json({ error: "Email already registered" });
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
            firstName,
            middleName,
            lastName,
            mobile,
            email: email.toLowerCase(),
            passwordHash,
            gender,
            emailVerified: true,
            createdAt: new Date(),
        };
        const { insertedId } = await usersCollection.insertOne(newUser);
        const token = jwt.sign(
            { _id: insertedId.toString(), firstName, mobile, gender, email: email.toLowerCase() },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(201).json({
            message: "User created successfully.",
            token,
            user: { _id: insertedId.toString(), firstName, middleName, lastName, mobile, gender, email: email.toLowerCase(), emailVerified: true },
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/resend-otp", async (req, res) => {
    try {
        const { email, firstName } = req.body;
        if (!email || !isValidEmailSimple(email))
            return res.status(400).json({ error: "Valid email required" });
        const lowEmail = email.toLowerCase();
        const existingUser = await usersCollection.findOne({ email: lowEmail });
        if (existingUser) {
            return res.status(400).json({ error: "This email is already registered. Please log in." });
        }
        const lastOtp = await emailOtpsCollection.findOne({ email: lowEmail }, { sort: { createdAt: -1 } });
        if (lastOtp && lastOtp.createdAt) {
            const secondsSince = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;
            if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS)
                return res.status(429).json({
                    error: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before resending OTP`,
                });
        }
        await emailOtpsCollection.deleteMany({ email: lowEmail });
        const otp = generateNumericOtp(OTP_LENGTH);
        const otpHash = await bcrypt.hash(otp, 10);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + OTP_TTL_MINUTES * 60 * 1000);
        await emailOtpsCollection.insertOne({
            email: lowEmail,
            otpHash,
            createdAt,
            expiresAt,
            attempts: 0,
        });
        await fireN8nWebhook(N8N_WEBHOOK_URL, {
            type: "email_otp",
            email: lowEmail,
            firstName: firstName || "User",
            EmailOTP: otp,
            subject: "Your Mandir Darshan Verification Code",
            expiresAt: expiresAt.toISOString(),
            meta: { origin: "resend" },
        });
        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("Resend OTP error:", err);
        res.status(500).json({ error: "Failed to resend OTP" });
    }
});

app.post("/api/verify-email", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ error: "Email and OTP required" });
        const lowEmail = email.toLowerCase();
        const otpDoc = await emailOtpsCollection.findOne({ email: lowEmail });
        if (!otpDoc) return res.status(400).json({ error: "OTP is expired or invalid. Please request a new one." });
        if (otpDoc.expiresAt < new Date())
            return res.status(400).json({ error: "OTP has expired" });
        const match = await bcrypt.compare(String(otp).trim(), otpDoc.otpHash);
        if (!match) {
            await emailOtpsCollection.updateOne({ _id: otpDoc._id }, { $inc: { attempts: 1 } });
            return res.status(400).json({ error: "Invalid OTP" });
        }
        await emailOtpsCollection.deleteMany({ email: lowEmail });
        res.json({ message: "Email verified successfully" });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { mobile, password } = req.body;
        if (!mobile || !password) return res.status(400).json({ error: "Mobile and password required" });
        const user = await usersCollection.findOne({ mobile });
        if (!user) return res.status(401).json({ error: "User not found" });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
        if (!user.emailVerified) {
            return res.status(401).json({ error: "Please verify your email before logging in." });
        }
        await blacklistedTokensCollection.deleteMany({ userId: user._id });
        const token = jwt.sign({ _id: user._id.toString(), firstName: user.firstName, mobile: user.mobile, gender: user.gender, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token, user: { _id: user._id.toString(), firstName: user.firstName, middleName: user.middleName, lastName: user.lastName, mobile: user.mobile, gender: user.gender, email: user.email, emailVerified: !!user.emailVerified } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/send-login-otp", async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || mobile.length !== 10) {
            return res.status(400).json({ error: "A valid 10-digit mobile number is required." });
        }
        const existingUser = await usersCollection.findOne({ mobile });
        if (!existingUser) {
            return res.status(404).json({ error: "No account is associated with this mobile number." });
        }
        const lastOtp = await mobileOtpsCollection.findOne({ mobile }, { sort: { createdAt: -1 } });
        if (lastOtp && lastOtp.createdAt) {
            const secondsSince = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;
            if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
                return res.status(429).json({
                    error: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting a new OTP.`,
                });
            }
        }
        
        const otp = generateNumericOtp(OTP_LENGTH);
        const otpHash = await bcrypt.hash(otp, 10);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + OTP_TTL_MINUTES * 60 * 1000);
        await mobileOtpsCollection.insertOne({
            mobile,
            otpHash,
            createdAt,
            expiresAt,
        });
        await fireN8nWebhook(N8N_WEBHOOK_MOBILE_URL, {
            type: "sms_otp",
            firstName: existingUser.firstName,
            mobile: mobile,
            MobileOTP: otp,
            expiresAt: expiresAt.toISOString(),
            meta: { origin: "login" },
        });
        res.json({ message: "OTP has been sent to your mobile number." });
    } catch (err) {
        console.error("Send Login OTP error:", err);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
});

app.post("/api/login-with-otp", async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ error: "Mobile number and OTP are required." });
        }

        const otpDoc = await mobileOtpsCollection.findOne({ mobile }, { sort: { createdAt: -1 } });

        if (!otpDoc) {
            return res.status(400).json({ error: "Invalid or expired OTP. Please request a new one." });
        }

        if (otpDoc.expiresAt < new Date()) {
            await mobileOtpsCollection.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }
        
        const trimmedOtp = String(otp).trim();

        const match = await bcrypt.compare(trimmedOtp, otpDoc.otpHash);

        if (!match) {
            return res.status(400).json({ error: "The OTP you entered is incorrect." });
        }

        const user = await usersCollection.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        await mobileOtpsCollection.deleteOne({ _id: otpDoc._id });
        await blacklistedTokensCollection.deleteMany({ userId: user._id });
        const token = jwt.sign(
            { _id: user._id.toString(), firstName: user.firstName, mobile: user.mobile, gender: user.gender, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        res.json({
            message: "Login successful",
            token,
            user: { _id: user._id.toString(), firstName: user.firstName, middleName: user.middleName, lastName: user.lastName, mobile: user.mobile, gender: user.gender, email: user.email, emailVerified: !!user.emailVerified }
        });

    } catch (err) {
        console.error("Login with OTP error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});


app.get("/api/temples", async (req, res) => {
    try {
        const { searchTerm, category, state, sortBy } = req.query;
        const templeDoc = await assetsCollection.findOne({ category: "temple" });
        if (!templeDoc) return res.json([]);
        let results = Array.isArray(templeDoc.items) ? [...templeDoc.items] : [];
        if (searchTerm && typeof searchTerm === "string" && searchTerm.trim()) {
            const term = escapeRegexSafe(searchTerm.trim());
            const startsRegex = new RegExp("^" + term, "i");
            const nameMatches = results.filter(t => startsRegex.test(t.name || "") || startsRegex.test(t.deity || ""));
            const districtMatches = results.filter(t => startsRegex.test(t.location?.district || "") && !nameMatches.includes(t));
            const stateMatches = results.filter(t => startsRegex.test(t.location?.state || "") && !nameMatches.includes(t) && !districtMatches.includes(t));
            results = [...nameMatches, ...districtMatches, ...stateMatches];
        }
        if (category && typeof category === "string" && category.trim()) {
            const catRegex = new RegExp(escapeRegexSafe(category.trim()), "i");
            results = results.filter((t) => catRegex.test(t.deity || ""));
        }
        if (state && typeof state === "string" && state.trim()) {
            const stateTerm = escapeRegexSafe(state.trim().replace(/-/g, " "));
            const stateRegex = new RegExp(stateTerm, "i");
            results = results.filter((t) => stateRegex.test(t.location?.state || ""));
        }
        const sortKey = sortBy || (results[0]?.id ? "id" : "");
        if (sortKey) {
            if (sortKey === "name") {
                results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            } else if (sortKey === "location") {
                results.sort((a, b) =>
                    (a.location?.state || "").localeCompare(b.location?.state || "") ||
                    (a.location?.district || "").localeCompare(b.location?.district || "")
                );
            } else if (sortKey === "popularity" && results[0]?.popularity !== undefined) {
                results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            } else if (sortKey === "id") {
                results.sort((a, b) => {
                    const ai = Number(a.id);
                    const bi = Number(b.id);
                    if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
                    return String(a.id || "").localeCompare(String(b.id || ""));
                });
            }
        }
        res.json(results);
    } catch (err) {
        console.error("Temple search error:", err);
        res.status(500).json({ error: "Failed to fetch temples" });
    }
});

app.post("/api/availability", async (req, res) => {
    try {
        const { temple_id, date, ticket_type } = req.body;
        if (!temple_id || !date || !ticket_type) {
            return res.status(400).json({ error: "temple_id, date, and ticket_type are required." });
        }
        
        const availableSlots = [];
        const openingHour = 8;
        const closingHour = 20; 

        for (let hour = openingHour; hour < closingHour; hour++) {
            if (Math.random() > 0.2) {
                const time = `${String(hour).padStart(2, '0')}:00`;
                availableSlots.push({
                    time_slot: time,
                    
                    available_tickets: Math.floor(Math.random() * 50) + 10, 
                });
            }
        }

        if (availableSlots.length === 0) {
            return res.json({ message: "No available slots found for the selected date.", slots: [] });
        }

        res.json({ slots: availableSlots });

    } catch (err) {
        console.error("Availability check error:", err);
        res.status(500).json({ error: "Failed to check availability." });
    }
});

app.post("/api/calculate-price", async (req, res) => {
    try {
        const { ticket_id, quantity } = req.body;
        if (!ticket_id || !quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "A valid ticket_id and quantity are required." });
        }

        const ticket = await ticketsCollection.findOne({ ticket_id });
        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found." });
        }

        const base_price = ticket.price;
        const total_price = base_price * quantity;
        const service_fee = 0;
        const grand_total = total_price + service_fee;

        res.json({
            breakdown: {
                base_price: base_price,
                quantity: quantity,
                service_fee: service_fee,
                total_price: total_price
            },
            grand_total: grand_total,
            currency: ticket.currency || "INR"
        });

    } catch (err) {
        console.error("Price calculation error:", err);
        res.status(500).json({ error: "Failed to calculate price." });
    }
});

app.post("/api/bookings", authenticateUserMiddleware, async (req, res) => {
    try {
        const { temple_id, ticket_id, date, time_slot, quantity, attendees, payment_id } = req.body;
        
        if (!temple_id || !ticket_id || !date || !time_slot || !quantity || !attendees || !payment_id) {
            return res.status(400).json({ error: "Missing required booking information." });
        }

        const isPaymentValid = true;
        if (!isPaymentValid) {
            return res.status(402).json({ error: "Payment verification failed." });
        }

        const ticket = await ticketsCollection.findOne({ ticket_id });
        if (!ticket) {
            return res.status(404).json({ error: "Ticket details not found." });
        }
        
        const newBooking = {
            booking_id: `BKNG_${Date.now()}`,
            user_id: new ObjectId(req.user._id),
            temple_id,
            ticket_id,
            booking_date: date,
            time_slot,
            quantity,
            total_amount: ticket.price * quantity,
            attendees,
            status: "confirmed",
            payment_id,
            created_at: new Date(),
        };

        const result = await bookingsCollection.insertOne(newBooking);

        res.status(201).json({
            message: "Booking successful!",
            confirmation: {
                booking_id: newBooking.booking_id,
                temple_id: newBooking.temple_id,
                date: newBooking.booking_date,
                time_slot: newBooking.time_slot,
                status: newBooking.status
            }
        });

    } catch (err) {
        console.error("Booking execution error:", err);
        res.status(500).json({ error: "Failed to create booking." });
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
        res.json({ message: "Profile updated successfully", user: { ...updatedUser, avatar: avatarBase64, }, });
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

app.post("/api/assets", authenticateUserMiddleware, async (req, res) => {
    try {
        if (!req.user.role || req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { category, items } = req.body;
        if (!category || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Invalid request body" });
        }
        const categoryDoc = await assetsCollection.findOne({ category });
        if (categoryDoc) {
            categoryDoc.items.push(...items);
            await assetsCollection.updateOne(
                { _id: categoryDoc._id },
                { $set: { items: categoryDoc.items } }
            );
        } else {
            await assetsCollection.insertOne({ category, items });
        }
        res.json({ message: "Temple items added successfully" });
    } catch (err) {
        console.error("Error adding temple items:", err);
        res.status(500).json({ error: "Failed to add temple items" });
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

app.put("/api/assets/temple/:id", authenticateUserMiddleware, async (req, res) => {
    try {
        if (!req.user.role || req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const itemId = req.params.id;
        const updatedData = req.body;
        const templeDocument = await assetsCollection.findOne({ category: "temple" });
        if (!templeDocument) {
            const newItem = { ...updatedData, id: itemId };
            await assetsCollection.insertOne({
                category: "temple",
                items: [newItem],
            });
            return res.status(201).json({
                message: "Temple created successfully",
                createdItem: newItem,
            });
        }
        const itemIndex = templeDocument.items.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) {
            const newItem = { ...updatedData, id: itemId };
            templeDocument.items.push(newItem);
            await assetsCollection.updateOne(
                { _id: templeDocument._id },
                { $set: { items: templeDocument.items } }
            );
            return res.status(201).json({
                message: "Temple created successfully",
                createdItem: newItem,
            });
        }
        templeDocument.items[itemIndex] = {
            ...templeDocument.items[itemIndex],
            ...updatedData,
        };
        await assetsCollection.updateOne(
            { _id: templeDocument._id },
            { $set: { items: templeDocument.items } }
        );
        res.json({
            message: "Temple updated successfully",
            updatedItem: templeDocument.items[itemIndex],
        });
    } catch (err) {
        console.error("Error upserting temple info:", err);
        res.status(500).json({ error: "Failed to upsert temple info" });
    }
});

app.delete("/api/assets/temple/:id", authenticateUserMiddleware, async (req, res) => {
    try {
        if (!req.user.role || req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const itemId = req.params.id;
        const templeDoc = await assetsCollection.findOne({ category: "temple" });
        if (!templeDoc) return res.status(404).json({ error: "Temple category not found" });
        const index = templeDoc.items.findIndex((item) => item.id === itemId);
        if (index === -1) return res.status(404).json({ error: "Temple not found" });
        templeDoc.items.splice(index, 1);
        await assetsCollection.updateOne(
            { _id: templeDoc._id },
            { $set: { items: templeDoc.items } }
        );
        res.json({ message: "Temple deleted successfully" });
    } catch (err) {
        console.error("Error deleting temple:", err);
        res.status(500).json({ error: "Failed to delete temple" });
    }
});

app.post("/api/openai", async (req, res) => {
    try {
        const { userInput } = req.body;
        if (!userInput) return res.status(400).json({ error: "userInput required" });
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json", },
            body: JSON.stringify({ model: "gpt-4", messages: [{ role: "system", content: "You are a helpful assistant for Mandir Darshan, answering questions about temples, locations, darshan, etc." }, { role: "user", content: userInput }], temperature: 0.7, max_tokens: 300 })
        });
        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content || "Sorry, I don't know.";
        res.json({ answer });
    } catch (err) {
        console.error("OpenAI proxy error:", err);
        res.status(500).json({ error: "Failed to get response from OpenAI" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));