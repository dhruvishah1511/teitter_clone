import Post from "./Post"; // Import the Post component which displays individual posts
import PostSkeleton from "../skeletons/PostSkeleton"; // Import the PostSkeleton component to show a loading skeleton while posts are being fetched
import { useQuery } from "@tanstack/react-query"; // Import the useQuery hook from react-query to handle data fetching
import { useEffect } from "react"; // Import the useEffect hook to handle side effects like refetching data when certain props change

const Posts = ({ feedType, username, userId }) => {
    // This function determines the API endpoint to use based on the feedType prop
    const getPostEndpoint = () => {
        switch (feedType) {
            case "forYou":
                return "/api/posts/all"; // For the "forYou" feed, fetch all posts
            case "following":
                return "/api/posts/following"; // For the "following" feed, fetch posts from followed users
            case "posts":
                return `/api/posts/user/${username}`; // For the user's posts, fetch posts of a specific user by username
            case "likes":
                return `/api/posts/likes/${userId}`; // For the liked posts feed, fetch posts liked by a specific user using userId
            default:
                return "/api/posts/all"; // Default case: fetch all posts
        }
    };

    // Get the API endpoint for fetching posts based on the feed type
    const POST_ENDPOINT = getPostEndpoint();

    // useQuery hook to fetch posts data based on the POST_ENDPOINT
    const {
        data: posts, // Data returned from the API call will be stored in 'posts'
        isLoading, // Boolean indicating whether the data is currently being loaded
        refetch, // Function to manually refetch the data
        isRefetching, // Boolean indicating whether a refetch operation is in progress
    } = useQuery({
        queryKey: ["posts"], // Unique key to identify this query in the cache
        queryFn: async () => {
            try {
                // Fetch data from the API endpoint
                const res = await fetch(POST_ENDPOINT);
                const data = await res.json();

                // Check if the response is not OK and throw an error if so
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }

                // Return the fetched data if everything is fine
                return data;
            } catch (error) {
                // Throw an error to be caught by react-query's error handling
                throw new Error(error);
            }
        },
    });

    // useEffect hook to refetch posts when feedType, username, or refetch function changes
    useEffect(() => {
        refetch(); // Manually trigger a refetch of the posts data
    }, [feedType, refetch, username]); // Dependencies: refetch when these values change

    return (
        <>
            {/* Show loading skeletons while posts are being loaded or refetched */}
            {(isLoading || isRefetching) && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton /> {/* Render the PostSkeleton component for loading state */}
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {/* Display message if there are no posts in the current tab */}
            {!isLoading && !isRefetching && posts?.length === 0 && (
                <p className='text-center my-4'>No posts in this tab. Switch 👻</p>
            )}
            {/* Render posts if data is loaded and not refetching */}
            {!isLoading && !isRefetching && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} /> // Render each post using the Post component
                    ))}
                </div>
            )}
        </>
    );
};

export default Posts; // Export the Posts component as default
