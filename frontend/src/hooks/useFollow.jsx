import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importing hooks for data fetching and caching
import toast from "react-hot-toast"; // Importing toast for notifications

const useFollow = () => {
	const queryClient = useQueryClient(); 
	const { mutate: follow, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const res = await fetch(`/api/users/follow/${userId}`, {
					method: "POST", 
				});

				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return; 
			} catch (error) {
				throw new Error(error.message); 
			}
		},
		onSuccess: () => {
			
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message); 
		},
	});

	return { follow, isPending }; 
};

export default useFollow; 
// const { follow, isPending } = useFollow();

// // Inside a component
// <button onClick={() => follow(userId)} disabled={isPending}>
//   {isPending ? "Following..." : "Follow"}
// </button>
