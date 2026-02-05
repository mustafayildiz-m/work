'use client';

import { useEffect, useRef, useState } from 'react';
import 'glightbox/dist/css/glightbox.min.css';

const GlightBox = ({
  children,
  href,
  ...other
}) => {
  const ref = useRef(null);
  const [glightbox, setGlightbox] = useState(null);
  const [instance, setInstance] = useState(null);

  // Dynamically import glightbox only on client side
  useEffect(() => {
    const loadGlightbox = async () => {
      try {
        const glightboxModule = await import('glightbox');
        setGlightbox(() => glightboxModule.default);
      } catch (error) {
        console.error('Failed to load glightbox:', error);
      }
    };
    
    loadGlightbox();
  }, []);

  useEffect(() => {
    let glightboxInstance = null;
    
    if (ref.current && glightbox) {
      glightboxInstance = glightbox({
        openEffect: 'fade',
        closeEffect: 'fade'
      });
      setInstance(glightboxInstance);
    }
    
    return () => {
      if (glightboxInstance?.destroy) {
        glightboxInstance.destroy();
      }
    };
  }, [ref, glightbox]);

  return <a ref={ref} href={href} {...other} className={`glightbox ${other['className']}`}>
      {children}
    </a>;
};

export default GlightBox;