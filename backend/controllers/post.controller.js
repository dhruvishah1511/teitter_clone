import Post from '../models/post.model.js'; // Import the Post model
import User from '../models/user.model.js'; // Import the User model
import Notification from "../models/notification.model.js"; // Import the Notification model
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary for image uploads

// Controller to create a new post
export const createPost = async (req, res) => {
    try {
        const { text } = req.body; // Destructure 'text' from request body
        let { img } = req.body; // Destructure 'img' from request body

        const userId = req.user._id.toString(); // Get the ID of the user making the request

        // Find the user making the request
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" }); // Check if user exists

        // Ensure that the post has either text or an image
        if (!text && !img) {
            return res.status(400).json({ error: "Post must have text or image" });
        }

        // If there's an image, upload it to Cloudinary
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = await uploadedResponse.secure_url; // Store the secure URL of the uploaded image
        }

        // Create a new post object
        const newPost = new Post({
            user: userId,
            text,
            img
        });

        // Save the new post to the database
        await newPost.save();
        res.status(201).json(newPost); // Respond with the created post
    } catch (error) {
        console.error("Error in createPost:", error.message); // Log error
        res.status(500).json({ error: error.message }); // Respond with error
    }
};

// Controller to delete a post
export const deletePost = async (req, res) => {
    try {
        // Find the post by ID
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" }); // Check if post exists
        }

        // Check if the current user is the author of the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this post" }); // Authorization check
        }

        // If the post has an image, delete it from Cloudinary
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]; // Extract image ID from URL
            await cloudinary.uploader.destroy(imgId); // Delete image from Cloudinary
        }

        // Delete the post from the database
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" }); // Confirm deletion
    } catch (error) {
        console.error("Error in deletePost controller:", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to comment on a post
export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body; // Get comment text from request body
        const postId = req.params.id; // Get post ID from URL parameters
        const userId = req.user._id; // Get user ID from request

        // Check if 'text' is provided
        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        // Find the post by its ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Create a new comment object
        const comment = {
            user: userId,
            text
        };

        // Add the comment to the post's comments array
        post.comments.push(comment);

        // Save the updated post
        await post.save();
        res.status(200).json(post); // Respond with the updated post
    } catch (error) {
        console.log("Error in commentOnPost controller:", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to like or unlike a post
export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from request
        const { id: postId } = req.params; // Get post ID from URL parameters

        const post = await Post.findById(postId); // Find the post

        // Check if post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user has already liked the post
        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike the post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // Remove user from likes
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }); // Remove post from likedPosts
            return res.status(200).json({ message: "Post unliked successfully" }); // Confirm unliking
        } else {
            // Like the post
            post.likes.push(userId); // Add user to likes
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }); // Add post to likedPosts
            await post.save(); // Save the post

            // Create and save a new like notification
            const notification = new Notification({
                from: userId,
                to: post.user, // Notify the post author
                type: "like",
            });
            await notification.save(); // Save the notification

            return res.status(200).json({ message: "Post liked successfully" }); // Confirm liking
        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error.message); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }) // Get all posts, sorted by creation date
            .populate({
                path: "user",
                select: "-password", // Exclude password from user data
            })
            .populate({
                path: "comments.user",
                select: "-password", // Exclude password from comments' user data
            });

        // Check if no posts are found
        if (posts.length === 0) {
            return res.status(200).json([]); // Return empty array if no posts
        }

        // Return the found posts
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts controller: ", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to get liked posts of a specific user
export const getLikedPosts = async (req, res) => {
    const userId = req.params.id; // Get user ID from URL parameters

    try {
        const user = await User.findById(userId); // Find the user
        if (!user) return res.status(404).json({ error: "User not found" }); // Check if user exists

        // Find posts that the user has liked
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password", // Exclude password from user data
            })
            .populate({
                path: "comments.user",
                select: "-password", // Exclude password from comments' user data
            });

        res.status(200).json(likedPosts); // Respond with liked posts
    } catch (error) {
        console.log("Error in getLikedPosts controller: ", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to get posts from users that the current user is following
export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from request
        const user = await User.findById(userId); // Find the user
        if (!user) return res.status(404).json({ error: "User not found" }); // Check if user exists

        const following = user.following; // Get the list of users being followed

        // Find posts from users that the current user follows
        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 }) // Sort by creation date
            .populate({
                path: "user",
                select: "-password", // Exclude password from user data
            })
            .populate({
                path: "comments.user",
                select: "-password", // Exclude password from comments' user data
            });

        res.status(200).json(feedPosts); // Respond with feed posts
    } catch (error) {
        console.log("Error in getFollowingPosts controller: ", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};

// Controller to get posts from a specific user by username
export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params; // Get username from URL parameters

        const user = await User.findOne({ username }); // Find the user by username
        if (!user) return res.status(404).json({ error: "User not found" }); // Check if user exists

        // Find posts made by the user
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 }) // Sort by creation date
            .populate({
                path: "user",
                select: "-password", // Exclude password from user data
            })
            .populate({
                path: "comments.user",
                select: "-password", // Exclude password from comments' user data
            });

        res.status(200).json(posts); // Respond with user's posts
    } catch (error) {
        console.log("Error in getUserPosts controller: ", error); // Log error
        res.status(500).json({ error: "Internal server error" }); // Respond with error
    }
};
