import { useState, useEffect, useCallback, RefObject } from 'react';

export const useEditorFullscreen = (containerRef: RefObject<HTMLDivElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.warn('Exit fullscreen failed', err));
    }
    setIsFullscreen(false);
    // Remove history state added on enter
    if (window.history.state?.isEditorFullscreen) {
      window.history.back();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => console.warn('Enter fullscreen failed', err));
      }
      setIsFullscreen(true);
      // Add state to handle back button
      window.history.pushState({ isEditorFullscreen: true }, '');
    } else {
      exitFullscreen();
    }
  }, [isFullscreen, containerRef, exitFullscreen]);

  // Handle Escape key and Back button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    const handlePopState = (e: PopStateEvent) => {
      if (isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFullscreen, exitFullscreen]);

  return { isFullscreen, toggleFullscreen };
};
