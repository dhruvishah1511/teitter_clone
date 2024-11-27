import { Link } from "react-router-dom"; // Importing Link for navigation
import { useState } from "react"; // Importing useState for managing form data

import XSvg from "../../../components/svgs/X"; // Importing SVG component for visual branding

import { MdOutlineMail, MdPassword, MdDriveFileRenameOutline } from "react-icons/md"; // Importing icons for UI
import { FaUser } from "react-icons/fa"; // Importing user icon
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importing React Query hooks
import toast from "react-hot-toast"; // Importing toast for notifications

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	}); // State for storing form input

	const queryClient = useQueryClient(); // Initialize query client for React Query

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, username, fullName, password }), // Sending form data
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to create account");
				console.log(data); // Log the response data
				return data;
			} catch (error) {
				console.error(error); // Log error to console
				throw error; // Rethrow the error
			}
		},
		onSuccess: () => {
			toast.success("Account created successfully"); // Notify user of success
			queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Refresh user data
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault(); // Prevent default form submission
		mutate(formData); // Trigger the mutation with form data
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value }); // Update form data state
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'> {/* Main container */}
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' /> {/* SVG branding on large screens */}
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' /> {/* SVG branding on smaller screens */}
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1> {/* Page heading */}
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail /> {/* Email icon */}
						<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email} // Controlled input for email
						/>
					</label>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser /> {/* Username icon */}
							<input
								type='text'
								className='grow'
								placeholder='Username'
								name='username'
								onChange={handleInputChange}
								value={formData.username} // Controlled input for username
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline /> {/* Full name icon */}
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName} // Controlled input for full name
							/>
						</label>
					</div>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword /> {/* Password icon */}
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password} // Controlled input for password
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Sign up"} {/* Button text changes based on loading state */}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>} {/* Display error message if sign up fails */}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button> {/* Link to login page */}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage; // Export SignUpPage component
