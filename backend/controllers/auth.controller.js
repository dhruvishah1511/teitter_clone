import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'; // Function to generate a token and set a cookie
import User from '../models/user.model.js'; // User model for MongoDB interactions
import bcrypt from 'bcryptjs'; // Library for hashing passwords

// Signup controller to handle user registration
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body; // Destructure user data from the request body
        
        // Email regex pattern for validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Check if the email is in a valid format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if username already exists in the database
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // Check if email is already taken
        const existingEmail = await User.findOne({ email });  
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        // Save the new user to the database and generate a token
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res); // Generate token and set cookie
            await newUser.save(); // Save user to the database

            // Send response with user details
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImage,
                coverImg: newUser.coverImg,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message); // Log error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Generic error message for the client
    }
};

// Login controller to handle user authentication
export const login = async (req, res) => {
    try {
        const { username, password } = req.body; // Destructure username and password from request body

        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Verify password using bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // If password is incorrect, return error
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate token and set cookie on successful login
        generateTokenAndSetCookie(user._id, res);

        // Send success response with user details
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        console.log("Error in login controller", error.message); // Log error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Generic error message for the client
    }
};

// Logout controller to handle user logout
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 }); // Clear the JWT cookie
        res.status(200).json({ message: "Logged out successfully" }); // Send success response
    } catch (error) {
        console.log("Error in logout controller", error.message); // Log error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Generic error message for the client
    }
};

// Get user details of the currently logged-in user
export const getMe = async (req, res) => {
    try {
        // Ensure `req.user` is populated by middleware (authentication)
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }

        // Find user by ID and exclude the password from the result
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send user details as response
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message); // Log error for debugging
        res.status(500).json({ error: "Internal Server Error" }); // Generic error message for the client
    }
};
