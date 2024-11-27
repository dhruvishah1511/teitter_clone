// Import React library (if using React)
import React from 'react';

// Define the RightPanelSkeleton component
const RightPanelSkeleton = () => {
    // Start rendering the skeleton loader
    return (
        <div className='flex flex-col gap-2 w-52 my-2'>
            // Outer container for layout

            <div className='flex gap-2 items-center'>
                // Flex container for avatar and info

                <div className='skeleton w-8 h-8 rounded-full shrink-0'></div>
                // Skeleton loader for user avatar (circle)

                <div className='flex flex-1 justify-between'>
                    // Container for user info and action button

                    <div className='flex flex-col gap-1'>
                        // Column for username and status

                        <div className='skeleton h-2 w-12 rounded-full'></div>
                        // Skeleton for username placeholder

                        <div className='skeleton h-2 w-16 rounded-full'></div>
                        // Skeleton for status placeholder
                    </div>

                    <div className='skeleton h-6 w-14 rounded-full'></div>
                    // Skeleton for action button placeholder
                </div>
            </div>
        </div>
    );
};

// Export the component for use in other parts of the application
export default RightPanelSkeleton;
