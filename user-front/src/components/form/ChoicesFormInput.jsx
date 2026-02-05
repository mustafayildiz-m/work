'use client';

import { useEffect, useRef, useState } from 'react';

const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  ...props
}) => {
  const choicesRef = useRef(null);
  const [Choices, setChoices] = useState(null);
  const [choicesInstance, setChoicesInstance] = useState(null);

  // Dynamically import choices.js only on client side
  useEffect(() => {
    const loadChoices = async () => {
      try {
        const choicesModule = await import('choices.js');
        setChoices(() => choicesModule.default);
      } catch (error) {
        console.error('Failed to load choices.js:', error);
      }
    };
    
    loadChoices();
  }, []);

  useEffect(() => {
    if (choicesRef.current && Choices) {
      const choices = new Choices(choicesRef.current, {
        ...options,
        placeholder: true,
        allowHTML: true,
        shouldSort: false
      });
      
      setChoicesInstance(choices);
      
      choices.passedElement.element.addEventListener('change', e => {
        if (!(e.target instanceof HTMLSelectElement)) return;
        if (onChange) {
          onChange(e.target.value);
        }
      });
    }
    
    return () => {
      if (choicesInstance?.destroy) {
        choicesInstance.destroy();
      }
    };
  }, [choicesRef, onChange, options, Choices, choicesInstance]);
  
  return allowInput ? <input ref={choicesRef} multiple={multiple} className={className} {...props} /> : <select ref={choicesRef} multiple={multiple} className={className} {...props}>
      {children}
    </select>;
};

export default ChoicesFormInput;