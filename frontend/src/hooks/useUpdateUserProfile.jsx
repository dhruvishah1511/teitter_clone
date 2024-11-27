import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importing hooks for managing mutations and caching
import toast from "react-hot-toast"; // Importing toast for notifications

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient(); // Initialize query client

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST", 
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData), 
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong"); 
				}
				return data;
			} catch (error) {
				throw new Error(error.message); 
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully"); 
			
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile }; 
};

export default useUpdateUserProfile; // Export the hook
// how to use
// const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

// const handleProfileUpdate = async (formData) => {
// 	try {
// 		await updateProfile(formData);
// 	} catch (error) {
// 		console.error("Profile update failed:", error);
// 	}
// };

// // Inside your component's render method
// <button onClick={() => handleProfileUpdate({ username, email })} disabled={isUpdatingProfile}>
// 	{isUpdatingProfile ? "Updating..." : "Update Profile"}
// </button>
