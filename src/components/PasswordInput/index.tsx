import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

import Input from '../Input';
import { ToggleButton } from './styles';
import type { PasswordInputProps } from './types';

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      {...props}
      type={showPassword ? 'text' : 'password'}
      leftIcon={<Lock size={18} aria-hidden="true" />}
      rightIcon={
        <ToggleButton
          type="button"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          onClick={() => setShowPassword((currentValue) => !currentValue)}
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </ToggleButton>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
