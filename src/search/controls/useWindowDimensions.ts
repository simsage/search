import { useState, useEffect } from 'react';
import {WindowDimensions} from "../../types";

export default function useWindowDimensions(): WindowDimensions {
  const hasWindow = typeof window !== 'undefined';

  function getWindowDimensions(): WindowDimensions {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(getWindowDimensions());

  // Define handleResize outside the useEffect to avoid TypeScript error
  const handleResize = (): void => {
    setWindowDimensions(getWindowDimensions());
  };

  useEffect(() => {
    if (hasWindow) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWindow]);

  return windowDimensions;
}
