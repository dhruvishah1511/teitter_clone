import { FaRegComment, FaRegHeart, FaTrash, FaRegBookmark } from "react-icons/fa"; 
import { BiRepost } from "react-icons/bi"; 
import { useState } from "react"; 
import { Link } from "react-router-dom"; 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; 
import { toast } from "react-hot-toast"; 
import LoadingSpinner from "./LoadingSpinner"; 
import { formatPostDate } from "../../utils/date"; 

const Post = ({ post = {} }) => {
    const [comment, setComment] = useState(""); 
    const { data: authUser, error: authError } = useQuery({ queryKey: ["authUser"] });
    const queryClient = useQueryClient();

    // Handle error fetching user data
    if (authError) {
        console.error("Error fetching user:", authError);
        return <div>Error loading user information.</div>; 
    }

    const postOwner = post.user || {};
    const isLiked = post.likes?.includes(authUser?._id);
    const isMyPost = authUser?._id === postOwner._id;
    const formattedDate = formatPostDate(post.createdAt) || 'Date not available';

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete post");
        },
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/posts/like/${post._id}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to like post");
            return res.json();
        },
        onSuccess: (updatedLikes) => {
            queryClient.setQueryData(["posts"], (oldData) => 
                oldData.map((p) => (p._id === post._id ? { ...p, likes: updatedLikes } : p))
            );
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: commentPost, isPending: isCommenting } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/posts/comment/${post._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: comment }),
            });
            if (!res.ok) throw new Error("Failed to post comment");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Comment posted successfully");
            setComment("");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDeletePost = () => deletePost();
    const handlePostComment = (e) => {
        e.preventDefault();
        if (isCommenting) return;
        commentPost();
    };

    const handleLikePost = () => {
        if (isLiking) return;
        likePost();
    };

    return (
        <div className='flex gap-2 items-start p-4 border-b border-gray-700'>
            <div className='avatar'>
                <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                    <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={`${postOwner.username}'s avatar`} />
                </Link>
            </div>
            <div className='flex flex-col flex-1'>
                <div className='flex gap-2 items-center'>
                    <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                        {postOwner.fullName}
                    </Link>
                    <span className='text-gray-700 flex gap-1 text-sm'>
                        <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
                        <span>·</span>
                        <span>{formattedDate}</span>
                    </span>
                    {isMyPost && (
                        <span className='flex justify-end flex-1'>
                            {!isDeleting && (
                                <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
                            )}
                            {isDeleting && <LoadingSpinner size='sm' />}
                        </span>
                    )}
                </div>
                <div className='flex flex-col gap-3 overflow-hidden'>
                    <span>{post.text}</span>
                    {post.img && (
                        <img
                            src={post.img}
                            className='h-80 object-contain rounded-lg border border-gray-700'
                            alt='Post content'
                        />
                    )}
                </div>
                <div className='flex justify-between mt-3'>
                    <div className='flex gap-4 items-center w-2/3 justify-between'>
                        <div
                            className='flex gap-1 items-center cursor-pointer group'
                            onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                        >
                            <FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
                            <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                {post.comments?.length || 0}
                            </span>
                        </div>
                        <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                            <div className='modal-box rounded border border-gray-600'>
                                <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                                <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                    {post.comments?.length === 0 && (
                                        <p className='text-sm text-slate-500'>
                                            No comments yet 🤔 Be the first one 😉
                                        </p>
                                    )}
                                    {post.comments?.map((comment) => (
                                        <div key={comment._id} className='flex gap-2 items-start'>
                                            <div className='avatar'>
                                                <div className='w-8 rounded-full'>
                                                    <img
                                                        src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                        alt={`${comment.user.username}'s avatar`}
                                                    />
                                                </div>
                                            </div>
                                            <div className='flex flex-col'>
                                                <div className='flex items-center gap-1'>
                                                    <span className='font-bold'>{comment.user.fullName}</span>
                                                    <span className='text-gray-700 text-sm'>
                                                        @{comment.user.username}
                                                    </span>
                                                </div>
                                                <div className='text-sm text-slate-400'>{comment.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handlePostComment}>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className='textarea textarea-bordered resize-none w-full mt-3'
                                        placeholder='Post your comment 😉'
                                    />
                                    <div className='modal-action'>
                                        <button type='submit' className='btn btn-sm btn-primary'>
                                            Submit
                                        </button>
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-ghost'
                                            onClick={() => window["comments_modal" + post._id].close()}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </dialog>
                        <div className='flex gap-1 items-center cursor-pointer group'>
                            <BiRepost className='w-5 h-5 text-slate-500 group-hover:text-emerald-400' />
                            <span className='text-sm text-slate-500 group-hover:text-emerald-400'>
                                {post.reposts?.length || 0}
                            </span>
                        </div>
                        <div className='flex gap-1 items-center cursor-pointer group' onClick={handleLikePost}>
                            <FaRegHeart
                                className={`w-4 h-4 ${isLiked ? "text-pink-600" : "text-slate-500"} group-hover:text-pink-600`}
                            />
                            <span className={`text-sm ${isLiked ? "text-pink-600" : "text-slate-500"} group-hover:text-pink-600`}>
                                {post.likes?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className='flex gap-1 items-center cursor-pointer group'>
                        <FaRegBookmark className='w-4 h-4 text-slate-500 group-hover:text-indigo-500' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
