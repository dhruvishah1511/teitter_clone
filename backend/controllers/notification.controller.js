import Notification from "../models/notification.model.js"; // Importing the Notification model

// Controller to get notifications for the logged-in user
export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id; // Extract the user ID from the request

		// Fetch notifications for the user, populating the 'from' field with username and profile image
		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg", // Select only username and profile image from the 'from' field
		});

		// Mark all notifications as read
		await Notification.updateMany({ to: userId }, { read: true });

		// Send the notifications back as a response
		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message); // Log error for debugging
		res.status(500).json({ error: "Internal Server Error" }); // Generic error message for the client
	}
};

// Controller to delete all notifications for the logged-in user
export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id; // Extract the user ID from the request

		// Delete all notifications associated with the user
		await Notification.deleteMany({ to: userId });

		// Send a success response
		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message); // Log error for debugging
		res.status(500).json({ error: "Internal Server Error" }); // Generic error message for the client
	}
};
