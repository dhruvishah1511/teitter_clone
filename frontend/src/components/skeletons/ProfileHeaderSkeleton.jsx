const ProfileHeaderSkeleton = () => {
    return (
        <div className='flex flex-col gap-2 w-full my-2 p-4'>
            {/* Outer container with flex column layout for the skeleton */}
            <div className='flex gap-2 items-center'>
                {/* Flex row to arrange the inner elements */}
                <div className='flex flex-1 gap-1'>
                    <div className='flex flex-col gap-1 w-full'>
                        {/* Username placeholder */}
                        <div className='skeleton h-4 w-12 rounded-full'></div>
                        {/* Status placeholder */}
                        <div className='skeleton h-4 w-16 rounded-full'></div>

                        {/* Main content area with a relative position */}
                        <div className='skeleton h-40 w-full relative'>
                            {/* Avatar placeholder positioned absolutely */}
                            <div className='skeleton h-20 w-20 rounded-full border absolute -bottom-10 left-3'></div>
                        </div>

                        {/* Action button or similar placeholder */}
                        <div className='skeleton h-6 mt-4 w-24 ml-auto rounded-full'></div>
                        {/* Additional info placeholders */}
                        <div className='skeleton h-4 w-14 rounded-full mt-4'></div>
                        <div className='skeleton h-4 w-20 rounded-full'></div>
                        <div className='skeleton h-4 w-2/3 rounded-full'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeaderSkeleton;
