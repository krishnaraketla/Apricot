import { useEffect, RefObject } from 'react';

/**
 * Hook to prevent scroll events in a container from propagating to parent elements
 * @param ref - React ref of the container element
 */
const useScrollContainment = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Check if scrolling up when already at the top
      if (e.deltaY < 0 && element.scrollTop <= 0) {
        // Allow natural behavior
        return;
      }
      
      // Check if scrolling down when already at the bottom
      if (e.deltaY > 0 && 
          element.scrollHeight - element.clientHeight <= element.scrollTop + 1) {
        // Allow natural behavior
        return;
      }
      
      // Otherwise prevent propagation to parent elements
      e.stopPropagation();
    };
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [ref]);
};

export default useScrollContainment; 