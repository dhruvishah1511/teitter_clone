import { useState } from "react"; // Import useState hook for managing component state

import Posts from "../../components/common/Posts"; // Import Posts component for displaying posts
import CreatePost from "./CreatePost"; // Import CreatePost component for creating new posts

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou"); // State to track the selected feed type

	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
				{/* Header Section */}
				<div className='flex w-full border-b border-gray-700'>
					<div
						className={
							"flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
						}
						onClick={() => setFeedType("forYou")} // Change feed type to "forYou" on click
					>
						For you
						{/* Highlight the selected tab with an underline */}
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary'></div>
						)}
					</div>
					<div
						className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
						onClick={() => setFeedType("following")} // Change feed type to "following" on click
					>
						Following
						{/* Highlight the selected tab with an underline */}
						{feedType === "following" && (
							<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary'></div>
						)}
					</div>
				</div>

				{/* Create Post Input Section */}
				<CreatePost /> {/* Component for creating a new post */}

				{/* Posts Section */}
				<Posts feedType={feedType} /> {/* Display posts based on the selected feed type */}
			</div>
		</>
	);
};

export default HomePage; // Export HomePage component
