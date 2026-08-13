import styled from 'styled-components';

export const DividerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

export const DividerLine = styled.span`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
`;
