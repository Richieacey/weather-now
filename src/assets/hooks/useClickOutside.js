import { useEffect } from 'react';

/**
 * Hook that alerts on clicks outside of the passed ref.
 * @param {React.MutableRefObject<HTMLElement | null>} ref - The React ref to monitor.
 * @param {() => void} handler - The function to call when a click outside is detected.
 */
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendant elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Use both mousedown and touchstart for better mobile compatibility
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};