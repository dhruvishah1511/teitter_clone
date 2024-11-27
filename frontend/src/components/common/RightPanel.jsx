import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useFollow from "../../hooks/useFollow"; // Custom hook for follow functionality
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton"; // Skeleton loader for the right panel
import LoadingSpinner from "./LoadingSpinner"; // Loading spinner component

const RightPanel = () => {
    // Fetch suggested users using react-query
    const { data: suggestedUsers, isLoading, isError, error } = useQuery({
        queryKey: ["suggestedUsers"], // Unique key for this query
        queryFn: async () => {
            // Fetch suggested users from the API
            const res = await fetch("/api/users/suggested");
            const data = await res.json();
            // Check for errors in the response
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong!"); // Throw an error if the response is not OK
            }
            return data; // Return the data if successful
        },
    });

    // Use custom hook to handle follow functionality
    const { follow, isPending } = useFollow(); // follow function and loading state

    // Return an empty div if there are no suggested users
    if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

    // Handle errors that occur during data fetching
    if (isError) return <div className="text-red-500">{error.message}</div>; // Display error message if there was an error

    return (
        <div className='hidden lg:block my-4 mx-2'>
            {/* Main container for the right panel */}
            <div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
                <p className='font-bold'>Who to follow</p> {/* Section title */}
                <div className='flex flex-col gap-4'>
                    {/* Show skeleton loaders while fetching data */}
                    {isLoading && (
                        <>
                            {/* Display multiple skeleton loaders to indicate loading state */}
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                        </>
                    )}

                    {/* Display list of suggested users after loading */}
                    {!isLoading &&
                        suggestedUsers?.map((user) => (
                            <Link
                                to={`/profile/${user.username}`} // Link to the user's profile
                                className='flex items-center justify-between gap-4'
                                key={user._id} // Unique key for each user
                            >
                                <div className='flex gap-2 items-center'>
                                    <div className='avatar'>
                                        <div className='w-8 rounded-full'>
                                            {/* User's profile image, with a placeholder if not available */}
                                            <img src={user.profileImg || "/avatar-placeholder.png"} alt={`${user.username}'s avatar`} />
                                        </div>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='font-semibold tracking-tight truncate w-28'>
                                            {user.fullName} {/* Display user's full name */}
                                        </span>
                                        <span className='text-sm text-slate-500'>@{user.username}</span> {/* Display user's username */}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent default behavior of the Link
                                            follow(user._id); // Call follow function from the custom hook
                                        }}
                                        disabled={isPending} // Disable button while follow action is pending
                                    >
                                        {isPending ? <LoadingSpinner size='sm' /> : "Follow"} {/* Show loading spinner or "Follow" text */}
                                    </button>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
