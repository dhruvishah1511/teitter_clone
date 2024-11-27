import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        // Retrieve token from cookies
        const token = req.cookies.jwt;

        // Check if the token exists
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }

        // Find the user associated with the token
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Attach user to request object for further use
        req.user = user;
        next();
    } catch (err) {
        console.log("Error in protectRoute middleware:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};