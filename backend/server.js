import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import timerRoutes from "./routes/timer.route.js"
// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/api/timer", timerRoutes)

// Routes


// Error handling

// Server running
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at http://localhost:${PORT}`);
    connectDB();
    
})
