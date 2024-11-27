import { useEffect, useState } from "react"; // Importing React hooks
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile"; // Importing custom hook for updating user profile

const EditProfileModal = ({ authUser }) => {
	// State to hold form data
	const [formData, setFormData] = useState({
		fullName: "",        // User's full name
		username: "",        // User's username
		email: "",           // User's email
		bio: "",             // User's bio
		link: "",            // User's personal link
		newPassword: "",     // New password input
		currentPassword: "",  // Current password input
	});

	// Extracting updateProfile function and loading state from the custom hook
	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	// Function to handle input changes
	const handleInputChange = (e) => {
		// Update formData state based on the input field's name and value
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Effect to set initial form data based on authenticated user
	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "", // Ensure no undefined values
				username: authUser.username || "",
				email: authUser.email || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				newPassword: "", // Reset new password field
				currentPassword: "", // Reset current password field
			});
		}
	}, [authUser]); // Run effect when authUser changes

	// Render the component
	return (
		<>
			{/* Button to open the edit profile modal */}
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>

			{/* Modal dialog for editing profile */}
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault(); // Prevent default form submission
							updateProfile(formData); // Call the updateProfile function with form data
						}}
					>
						{/* Input fields for user details */}
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName} // Bind value to state
								name='fullName' // Input name
								onChange={handleInputChange} // Handle input change
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.username}
								name='username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>
						<button type='submit' className='btn btn-primary rounded-full btn-sm text-white'>
							{isUpdatingProfile ? "Updating..." : "Update"} {/* Conditional rendering */}
						</button>
					</form>
				</div>
				{/* Button to close the modal */}
				<form method='dialog' className='modal-backdrop'>
					<button type='button' className='outline-none' onClick={() => document.getElementById("edit_profile_modal").close()}>
						Close
					</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal; // Export the component for use in other parts of the application
