const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bbgtk-auth";

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

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create dummy users
    const dummyUsers = [
      {
        nik: "1234567890123456",
        name: "Ahmad Rizki",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
      },
      {
        nik: "2345678901234567",
        name: "Siti Nurhaliza",
        password: await bcrypt.hash("password456", 10),
        createdAt: new Date(),
      },
      {
        nik: "3456789012345678",
        name: "Budi Santoso",
        password: await bcrypt.hash("password789", 10),
        createdAt: new Date(),
      },
      {
        nik: "4567890123456789",
        name: "Dewi Sartika",
        password: await bcrypt.hash("mypassword", 10),
        createdAt: new Date(),
      },
      {
        nik: "5678901234567890",
        name: "Andi Wijaya",
        password: await bcrypt.hash("secret123", 10),
        createdAt: new Date(),
      },
      {
        nik: "1221400291221400",
        name: "Tawakkal Rabbani M",
        password: await bcrypt.hash("purwokerto1904", 10),
        createdAt: new Date(),
      },
    ];

    // Insert dummy users
    const result = await User.insertMany(dummyUsers);
    console.log(`Inserted ${result.length} users`);

    // Ensure indexes are created (this is automatic with schema.index())
    await User.syncIndexes();
    console.log("Indexes synchronized");

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Dummy users created:");
    console.log(
      "NIK: 1234567890123456, Password: password123, Name: Ahmad Rizki"
    );
    console.log(
      "NIK: 2345678901234567, Password: password456, Name: Siti Nurhaliza"
    );
    console.log(
      "NIK: 3456789012345678, Password: password789, Name: Budi Santoso"
    );
    console.log(
      "NIK: 4567890123456789, Password: mypassword, Name: Dewi Sartika"
    );
    console.log(
      "NIK: 5678901234567890, Password: secret123, Name: Andi Wijaya"
    );
    console.log(
      "NIK: 1221400291221400, Password: purwokerto1904, Name: Tawakkal Rabbani M"
    );

    console.log("\n🚀 You can now start the server with: npm start");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⚠️  Process interrupted");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️  Process terminated");
  await mongoose.connection.close();
  process.exit(0);
});

seedDatabase();
