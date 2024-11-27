import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {createPost,deletePost,commentOnPost,likeUnlikePost,getAllPosts,getLikedPosts,getUserPosts,getFollowingPosts} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all",protectRoute,getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id",protectRoute,getLikedPosts);
router.post("/create",protectRoute,createPost);
router.delete("/:id",protectRoute,deletePost);
router.post("/comment/:id",protectRoute,commentOnPost);
router.post("/like/:id",protectRoute,likeUnlikePost);
router.get("/user/:username", protectRoute, getUserPosts)


export default router;
