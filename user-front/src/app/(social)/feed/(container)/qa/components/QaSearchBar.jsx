'use client';

import { useState, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';

export default function QaSearchBar({ onSearch, isRTL, t }) {
  const [value, setValue] = useState('');
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (val.length >= 2 || val.length === 0) {
        onSearch(val);
      }
    }, 300);
  };

  return (
    <Form.Group className="mb-3">
      <div className="input-group input-group-lg qa-search-group" dir={isRTL ? 'rtl' : 'ltr'}>
        <span className="input-group-text qa-search-icon">
          <BsSearch size={18} />
        </span>
        <Form.Control
          type="text"
          placeholder={t('qa.searchPlaceholder')}
          value={value}
          onChange={handleChange}
          className="qa-search-input"
        />
      </div>
    </Form.Group>
  );
}
