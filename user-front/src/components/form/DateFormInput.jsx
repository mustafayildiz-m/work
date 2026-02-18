'use client';

import ReactFlatpickr from 'react-flatpickr';
import { FormGroup, FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
import 'flatpickr/dist/flatpickr.css';

const DateFormInput = ({
  name,
  containerClassName: containerClass,
  control,
  id,
  label,
  placeholder,
  options,
  ...other
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={containerClass}>
          {label && (
            typeof label === 'string' ? (
              <FormLabel htmlFor={id ?? name}>
                {label}
              </FormLabel>
            ) : <>{label}</>
          )}
          <ReactFlatpickr
            {...field}
            id={id ?? name}
            className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
            options={{
              ...options,
              dateFormat: 'd.m.Y',
              allowInput: true
            }}
            placeholder={placeholder}
            onChange={(date) => {
              field.onChange(date[0]);
            }}
            value={field.value}
          />
          {fieldState.error?.message && (
            <Feedback type="invalid" className="text-start d-block">
              {fieldState.error?.message}
            </Feedback>
          )}
        </FormGroup>
      )}
    />
  );
};

export default DateFormInput;