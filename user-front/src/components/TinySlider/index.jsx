'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { objectsEqual, childrenEqual } from './utils';

const TinySlider = ({
  settings,
  onClick,
  onIndexChanged,
  onTransitionStart,
  onTransitionEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onInit,
  className,
  style,
  children
}) => {
  const ref = useRef(null);
  const [slider, setSlider] = useState(null);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [prevChildren, setPrevChildren] = useState(children);
  const [tns, setTns] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  let dragging = false;
  let count = 0;
  
  // Dynamically import tiny-slider only on client side
  useEffect(() => {
    const loadTinySlider = async () => {
      try {
        setIsLoading(true);
        const { tns: tnsModule } = await import('tiny-slider');
        setTns(() => tnsModule);
      } catch (error) {
        console.error('Failed to load tiny-slider:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTinySlider();
  }, []);
  
  const postInit = useCallback(() => {
    if (!slider) {
      if (count >= 4) {
        return onInit?.(false);
      }
      count++;
      return setTimeout(postInit, 100);
    }
    count = 0;
    const {
      events
    } = slider;
    if (events) {
      events.on('transitionStart', info => {
        dragging = true;
        onTransitionStart?.(info);
      });
      events.on('transitionEnd', info => {
        dragging = false;
        onTransitionEnd?.(info);
      });
      if (onIndexChanged) events.on('indexChanged', onIndexChanged);
      if (onTouchStart) events.on('touchStart', onTouchStart);
      if (onTouchMove) events.on('touchMove', onTouchMove);
      if (onTouchEnd) events.on('touchEnd', onTouchEnd);
    }
    onInit?.(true);
  }, [slider, onIndexChanged, onTransitionStart, onTransitionEnd, onTouchStart, onTouchMove, onTouchEnd, onInit]);
  
  const build = useCallback((customSettings = {}) => {
    if (!tns) return; // Don't build if tns is not loaded yet
    
    if (slider && slider.destroy && slider.rebuild) {
      slider.destroy();
      slider.rebuild();
    } else {
      if (ref.current == null) return;
      const mergedSettings = {
        ...customSettings,
        container: ref.current,
        onInit: () => postInit()
      };
      setSlider(tns(mergedSettings));
      if (!slider) return;
      if (ref.current) ref.current.className += ' tns-item';
    }
  }, [slider, postInit, tns]);
  
  // İlk useEffect - settings değiştiğinde build eder
  useEffect(() => {
    if (tns) { // Only build when tns is loaded
      build(settings);
    }
  }, [settings, build, tns]);
  
  // İkinci useEffect - settings veya children değiştiğinde build eder
  useEffect(() => {
    if (tns && (!objectsEqual(settings, prevSettings) || !childrenEqual(children, prevChildren))) {
      build(settings);
    }
    setPrevSettings(settings);
    setPrevChildren(children);
  }, [settings, children, prevSettings, prevChildren, build, tns]);
  
  // Üçüncü useEffect - component unmount olduğunda slider'ı destroy eder
  useEffect(() => {
    return () => {
      if (slider && slider.destroy) slider.destroy();
    };
  }, [slider]);
  
  const onClickHandler = event => {
    if (dragging || !onClick) return;
    if (!slider) return onClick(null, null, event);
    const info = slider.getInfo();
    const slideClicked = info.slideItems[info.index];
    onClick(slideClicked, info, event);
  };
  
  // Show loading state while tiny-slider is being loaded
  if (isLoading) {
    return <div className={className} style={style}>{children}</div>;
  }
  
  return <div ref={ref} onClick={onClickHandler} className={className} style={style}>
      {children}
    </div>;
};
export default TinySlider;