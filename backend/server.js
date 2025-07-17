import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors);

// Routes


// Error handling

// Server running
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at http://localhost:${PORT}`)
})
