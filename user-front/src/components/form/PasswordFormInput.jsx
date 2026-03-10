import { useState } from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const PasswordFormInput = ({
  name,
  containerClassName: containerClass,
  control,
  id,
  labelClassName: labelClass,
  label,
  noValidate,
  ...other
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return <Controller name={name} defaultValue={''} control={control} render={({
    field,
    fieldState
  }) => <FormGroup className={containerClass ?? ''}>
          {label && (typeof label === 'string' ? <FormLabel htmlFor={id ?? name} className={labelClass}>
                {label}
              </FormLabel> : <>{label}</>)}
          <div>
            <div className="position-relative d-inline-block w-100">
              <FormControl id={id} type={showPassword ? 'text' : 'password'} {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
              <span
                className="d-flex align-items-center justify-content-center position-absolute top-50 end-0 translate-middle-y p-0 pe-2"
                style={{ zIndex: 10 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} className="cursor-pointer" /> : <FaEye size={18} className="cursor-pointer" />}
              </span>
            </div>
            {!noValidate && fieldState.error?.message && <Feedback type="invalid" className="text-start">
                {fieldState.error?.message}
              </Feedback>}
          </div>
        </FormGroup>} />;
};
export default PasswordFormInput;