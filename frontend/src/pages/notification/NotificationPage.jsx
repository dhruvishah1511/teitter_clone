import { Link } from "react-router-dom"; // Import Link for navigation between routes
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import hooks for data fetching and mutation
import { toast } from "react-hot-toast"; // Import toast for notifications

import LoadingSpinner from "../../components/common/LoadingSpinner"; // Import loading spinner component

import { IoSettingsOutline } from "react-icons/io5"; // Import settings icon
import { FaUser } from "react-icons/fa"; // Import user icon
import { FaHeart } from "react-icons/fa6"; // Import heart icon

const NotificationPage = () => {
	const queryClient = useQueryClient(); // Create a query client for cache management
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"], // Unique key for notifications query
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications"); // Fetch notifications from the API
				const data = await res.json(); // Parse the response to JSON
				if (!res.ok) throw new Error(data.error || "Something went wrong"); // Handle errors
				return data; // Return the notifications data
			} catch (error) {
				throw new Error(error); // Handle any fetch errors
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE", // DELETE request to remove notifications
				});
				const data = await res.json(); // Parse the response to JSON

				if (!res.ok) throw new Error(data.error || "Something went wrong"); // Handle errors
				return data; // Return the response data
			} catch (error) {
				throw new Error(error); // Handle any fetch errors
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully"); // Show success notification
			queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Invalidate notifications query to refresh data
		},
		onError: (error) => {
			toast.error(error.message); // Show error notification
		},
	});

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				{/* Header Section */}
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p> {/* Page title */}
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' /> {/* Settings icon */}
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a> {/* Link to delete notifications */}
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' /> {/* Loading spinner while fetching notifications */}
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>} {/* Message for no notifications */}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{/* Icon based on notification type */}
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}> {/* Link to user's profile */}
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} /> {/* User's avatar */}
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{/* Notification message based on type */}
									{notification.type === "follow" ? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default NotificationPage; // Export NotificationPage component
