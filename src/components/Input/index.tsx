import { forwardRef } from 'react';

import { ErrorText, HelperText, InputContainer, Label, StyledInput, Wrapper } from './styles';

import { InputProps } from './types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, fullWidth = true, id, ...props }, ref) => {
    return (
      <Wrapper $fullWidth={fullWidth} $hasError={!!error}>
        {label && <Label htmlFor={id}>{label}</Label>}

        <InputContainer $hasError={!!error} $fullWidth={fullWidth}>
          {leftIcon}

          <StyledInput ref={ref} id={id} {...props} />

          {rightIcon}
        </InputContainer>

        {error ? (
          <ErrorText>{error}</ErrorText>
        ) : (
          helperText && <HelperText>{helperText}</HelperText>
        )}
      </Wrapper>
    );
  },
);

Input.displayName = 'Input';

export default Input;
