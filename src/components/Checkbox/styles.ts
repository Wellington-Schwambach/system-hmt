import styled from 'styled-components';

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
`;

export const CheckboxInput = styled.input`
  width: 1.15rem;
  height: 1.15rem;
  margin: 0;
  accent-color: ${({ theme }) => theme.colors.brandGreen};
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 3px;
  }
`;
