import styled from 'styled-components';

export const Heading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.brandGreenSoft},
    ${({ theme }) => theme.colors.surfaceElevated}
  );
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1rem, 2vw, 1.2rem);
`;

export const Subtitle = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.8rem;
  font-weight: 600;
`;
