import User from "../models/user.model.js"; // Import the User model
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary for image uploads
import Notification from "../models/notification.model.js"; // Import the Notification model

// Controller to get user profile by username
export const getUserProfile = async (req, res) => {
    const { username } = req.params; // Extract username from URL parameters
    try {
        // Find the user by username and exclude the password field
        const user = await User.findOne({ username }).select("-password");

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Send the user profile data as a response
        res.status(200).json(user);
    } catch (error) {
        // Log the error and send a server error response
        console.log("Error in getUserProfile:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Controller to follow or unfollow a user
export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // The ID of the user to follow/unfollow
        const userToModify = await User.findById(id); // Find the target user
        const currentUser = await User.findById(req.user._id); // Find the current user

        // Ensure users aren't trying to follow/unfollow themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        // Ensure both users exist
        if (!userToModify || !currentUser) return res.status(404).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id); // Check if already following

        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // Remove current user from followers
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // Remove target user from following
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); // Add current user to followers
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // Add target user to following

            // Create and save a new follow notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();

            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        // Log the error and send a server error response
        console.error("Error in followUnfollowUser:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Controller to get suggested users for the current user
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id; // Get the current user's ID

        // Get the list of users followed by the current user
        const usersFollowedByMe = await User.findById(userId).select("following");

        // Find all users except the current user
        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } }, // Exclude current user
            { $sample: { size: 10 } } // Randomly select 10 users
        ]);

        // Filter out users already followed by the current user
        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));

        // Get only 4 suggested users
        const suggestedUsers = filteredUsers.slice(0, 4);

        // Remove the password from the suggested users
        suggestedUsers.forEach(user => user.password = null);

        // Send the suggested users as the response
        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUsers:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Controller to update user information
export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body; // Destructure request body
    let { profileImg, coverImg } = req.body; // Get profile and cover images
    const userId = req.user._id; // Get user ID from request

    try {
        let user = await User.findById(userId); // Find the user by ID
        if (!user) return res.status(404).json({ message: "User not found" }); // Check if user exists

        // Handle password update if necessary
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password); // Compare passwords
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10); // Generate salt
            user.password = await bcrypt.hash(newPassword, salt); // Hash the new password
        }

        // Handle profile image update via Cloudinary
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); // Remove old image from Cloudinary
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg); // Upload new image
            profileImg = uploadedResponse.secure_url; // Store the new secure URL
        }

        // Handle cover image update via Cloudinary
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); // Remove old cover image from Cloudinary
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg); // Upload new cover image
            coverImg = uploadedResponse.secure_url; // Store the new secure URL
        }

        // Update other user details
        user.fullName = fullName || user.fullName; // Update fullName if provided
        user.email = email || user.email; // Update email if provided
        user.username = username || user.username; // Update username if provided
        user.bio = bio || user.bio; // Update bio if provided
        user.link = link || user.link; // Update link if provided
        user.profileImg = profileImg || user.profileImg; // Update profile image if provided
        user.coverImg = coverImg || user.coverImg; // Update cover image if provided

        // Save updated user
        await user.save(); // Save changes to the database
        user.password = null; // Remove password from the response
        res.status(200).json(user); // Send back the updated user data

    } catch (error) {
        console.log("Error in updateUser:", error.message); // Log error
        res.status(500).json({ error: error.message }); // Respond with error
    }
};
