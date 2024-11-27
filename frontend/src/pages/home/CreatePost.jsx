import { CiImageOn } from "react-icons/ci"; // Importing the image icon
import { BsEmojiSmileFill } from "react-icons/bs"; // Importing the emoji icon
import { useRef, useState } from "react"; // Importing React hooks
import { IoCloseSharp } from "react-icons/io5"; // Importing the close icon
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Importing React Query hooks
import { toast } from "react-hot-toast"; // Importing toast notifications

const CreatePost = () => {
	const [text, setText] = useState(""); // State for post text
	const [img, setImg] = useState(null); // State for post image
	const imgRef = useRef(null); // Ref for file input

	const { data: authUser } = useQuery({ queryKey: ["authUser"] }); // Fetch authenticated user data
	const queryClient = useQueryClient(); // Initialize query client

	// Mutation for creating a post
	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			try {
				const res = await fetch("/api/posts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text, img }), // Sending text and image data to the server
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data; // Return created post data
			} catch (error) {
				throw new Error(error); // Handle errors
			}
		},

		// Success handler for the mutation
		onSuccess: () => {
			setText(""); // Reset text
			setImg(null); // Reset image
			toast.success("Post created successfully"); // Show success notification
			queryClient.invalidateQueries({ queryKey: ["posts"] }); // Invalidate posts query to refresh data
		},
	});

	// Form submission handler
	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission
		createPost({ text, img }); // Call createPost mutation
	};

	// Image change handler
	const handleImgChange = (e) => {
		const file = e.target.files[0]; // Get the selected file
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result); // Set the image state to the file data URL
			};
			reader.readAsDataURL(file); // Read the file as data URL
		}
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} /> {/* Display user avatar */}
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
					placeholder='What is happening?!'
					value={text} // Controlled input for text
					onChange={(e) => setText(e.target.value)} // Update text state on change
				/>
				{img && ( // If an image is selected, display it
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null); // Clear image state
								imgRef.current.value = null; // Reset file input
							}}
						/>
						<img src={img} className='w-full mx-auto h-72 object-contain rounded' />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()} // Trigger file input on icon click
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} /> {/* Hidden file input */}
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"} {/* Button text changes based on posting state */}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>} {/* Display error message if mutation fails */}
			</form>
		</div>
	);
};

export default CreatePost; // Export CreatePost component
