require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bbgtk-auth";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  nik: {
    type: String,
    required: true,
    unique: true,
    length: 16,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index definition to schema
const User = mongoose.model("User", userSchema);

// Quiz Session Schema
const quizSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageType: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  results: {
    type: Object,
    default: {},
  },
});

const QuizSession = mongoose.model("QuizSession", quizSessionSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies["auth-token"];

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
};

// Routes
// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve halaman_pemetaan (protected route)
app.get("/halaman_pemetaan", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "halaman_pemetaan.html"));
});

// Serve halaman_soal (protected route)
app.get("/halaman_soal", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "halaman_soal.html"));
});

// API Routes
// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { nik, password } = req.body;

    if (!nik || !password) {
      return res.status(400).json({ error: "NIK dan password harus diisi" });
    }

    // Validate NIK format (16 digits)
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ error: "NIK harus berupa 16 digit angka" });
    }

    const user = await User.findOne({ nik });

    if (!user) {
      return res.status(401).json({ error: "NIK atau password salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "NIK atau password salah" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, nik: user.nik, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 24 hours
      path: "/",
    });

    res.json({
      message: "Login berhasil",
      user: { nik: user.nik, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  try {
    res.clearCookie("auth-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// Check authentication status
app.get("/api/auth/check", verifyToken, (req, res) => {
  res.json({
    message: "Token valid",
    user: {
      nik: req.user.nik,
      name: req.user.name,
    },
  });
});

// Create quiz session
app.post("/api/quiz/start", verifyToken, async (req, res) => {
  try {
    const { packageType } = req.body;

    if (!packageType) {
      return res.status(400).json({ error: "Package type is required" });
    }

    // Check if user has an active quiz session
    const activeSession = await QuizSession.findOne({
      userId: req.user.userId,
      isCompleted: false,
    });

    if (activeSession) {
      return res.json({
        message: "Active session found",
        sessionId: activeSession._id,
        packageType: activeSession.packageType,
        startTime: activeSession.startTime,
      });
    }

    // Create new quiz session
    const newSession = new QuizSession({
      userId: req.user.userId,
      packageType: packageType,
    });

    await newSession.save();

    res.json({
      message: "Quiz session created",
      sessionId: newSession._id,
      packageType: newSession.packageType,
      startTime: newSession.startTime,
    });
  } catch (error) {
    console.error("Quiz start error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// Complete quiz session
app.post("/api/quiz/complete", verifyToken, async (req, res) => {
  try {
    const { sessionId, results } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await QuizSession.findOne({
      _id: sessionId,
      userId: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Quiz session not found" });
    }

    // Update session
    session.isCompleted = true;
    session.endTime = new Date();
    session.results = results || {};

    await session.save();

    res.json({
      message: "Quiz completed successfully",
      session: {
        id: session._id,
        packageType: session.packageType,
        startTime: session.startTime,
        endTime: session.endTime,
        results: session.results,
      },
    });
  } catch (error) {
    console.error("Quiz complete error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

// Seed database endpoint (for development)
app.post("/api/seed", async (req, res) => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create dummy users
    const dummyUsers = [
      {
        nik: "1234567890123456",
        name: "Ahmad Rizki",
        password: await bcrypt.hash("password123", 10),
      },
      {
        nik: "2345678901234567",
        name: "Siti Nurhaliza",
        password: await bcrypt.hash("password456", 10),
      },
      {
        nik: "3456789012345678",
        name: "Budi Santoso",
        password: await bcrypt.hash("password789", 10),
      },
      {
        nik: "4567890123456789",
        name: "Dewi Sartika",
        password: await bcrypt.hash("mypassword", 10),
      },
      {
        nik: "5678901234567890",
        name: "Andi Wijaya",
        password: await bcrypt.hash("secret123", 10),
      },
    ];

    await User.insertMany(dummyUsers);

    res.json({
      message: "Database seeded successfully",
      users: dummyUsers.map((user) => ({
        nik: user.nik,
        name: user.name,
        password: "password123/password456/password789/mypassword/secret123",
      })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat seeding database" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("- GET / (Landing page)");
  console.log("- GET /login (Login page)");
  console.log("- GET /halaman_pemetaan (Mapping page - protected)");
  console.log("- GET /halaman_soal (Quiz page - protected)");
  console.log("- POST /api/auth/login (Login API)");
  console.log("- POST /api/auth/logout (Logout API)");
  console.log("- GET /api/auth/check (Check auth status)");
  console.log("- POST /api/quiz/start (Start quiz session)");
  console.log("- POST /api/quiz/complete (Complete quiz session)");
  console.log("- POST /api/seed (Seed database with dummy data)");
});
