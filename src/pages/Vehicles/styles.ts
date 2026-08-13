import styled from 'styled-components';

export const Page = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 1rem;
`;

export const FeedbackMessage = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.8rem 0.95rem;
  border: 1px solid
    ${({ $type, theme }) =>
      $type === 'success' ? theme.colors.brandGreenBorder : theme.colors.dangerBorder};
  border-radius: 0.85rem;
  color: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.brandGreenDark : theme.colors.danger};
  background: ${({ $type, theme }) =>
    $type === 'success' ? theme.colors.brandGreenSoft : theme.colors.dangerSoft};
  font-size: 0.78rem;
  font-weight: 750;
`;
