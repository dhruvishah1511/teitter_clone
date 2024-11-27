import path from "path"; // Import path module for handling file paths
import express from "express"; // Import express framework
import dotenv from "dotenv"; // Import dotenv to manage environment variables
import cookieParser from "cookie-parser"; // Import cookie-parser for parsing cookies
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary for image handling

import authRoutes from "./routes/auth.routes.js"; // Import authentication routes
import userRoutes from "./routes/user.routes.js"; // Import user-related routes
import postRoutes from "./routes/post.routes.js"; // Import post-related routes
import notificationRoutes from "./routes/notification.routes.js"; // Import notification-related routes

import connectMongoDB from "./db/connectMongoDB.js"; // Import MongoDB connection utility

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express(); // Create an instance of the Express app
const PORT = process.env.PORT || 5000; // Set the port from environment variable or default to 5000
const __dirname = path.resolve(); // Get the directory name

// Middleware to parse JSON requests with a limit of 5mb
app.use(express.json({ limit: "5mb" }));
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser()); // Middleware to parse cookies

// Set up API routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/posts", postRoutes); // Post-related routes
app.use("/api/notifications", notificationRoutes); // Notification-related routes

// Serve static files and handle production setup
if (process.env.NODE_ENV === "production") {
	// Serve static files from the frontend's dist directory
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	// Handle all other requests by sending the index.html file
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Start the server and connect to MongoDB
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`); // Log the server's port
	connectMongoDB(); // Connect to MongoDB
});
