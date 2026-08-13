import styled from 'styled-components';

export const Page = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 1rem;
`;

export const FeedbackMessage = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.75rem 0.9rem;
  border: 1px solid
    ${({ $type, theme }) =>
      $type === 'error' ? theme.colors.dangerBorder : theme.colors.brandGreenBorder};
  border-radius: 0.85rem;
  color: ${({ $type, theme }) =>
    $type === 'error' ? theme.colors.danger : theme.colors.brandGreenDark};
  background: ${({ $type, theme }) =>
    $type === 'error' ? theme.colors.dangerSoft : theme.colors.brandGreenSoft};
  font-size: 0.78rem;
  font-weight: 750;
`;
