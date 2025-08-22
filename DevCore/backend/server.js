const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config(); // Load .env variables


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import Routes


const authRoutes = require('./routes/authRoutes');




// ✅ Use Routes


app.use('/api/auth', authRoutes);


// === Serve React build ===
// 1) Serve all files from frontend/dist
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 2) Fallback to index.html for client‑side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


// ✅ MongoDB connection using your Atlas connection string from .env
const mongoURI = process.env.MONGODB_URI || '';

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));




// ✅ Start server
app.listen(PORT, () => {

  console.log(`🚀 Server running at http://localhost:${PORT}`);
});