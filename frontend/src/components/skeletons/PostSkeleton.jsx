const PostSkeleton = () => {
    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            {/* Outer container with flex column layout for the post skeleton */}
            <div className='flex gap-4 items-center'>
                {/* Flex row for the avatar and user info */}
                <div className='skeleton w-10 h-10 rounded-full shrink-0'></div>
                {/* Avatar placeholder (circular shape) */}
                
                <div className='flex flex-col gap-2'>
                    {/* User info placeholders */}
                    <div className='skeleton h-2 w-12 rounded-full'></div>
                    {/* Username placeholder */}
                    
                    <div className='skeleton h-2 w-24 rounded-full'></div>
                    {/* Additional info placeholder (e.g., date or status) */}
                </div>
            </div>
            
            {/* Main content area placeholder for the post's body */}
            <div className='skeleton h-40 w-full'></div>
        </div>
    );
};

export default PostSkeleton;
