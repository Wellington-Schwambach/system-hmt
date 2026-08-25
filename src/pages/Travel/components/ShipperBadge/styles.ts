import styled from 'styled-components';

interface BadgeProps {
  $background: string;
  $foreground: string;
}

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.9rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid ${({ $background }) => $background};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $foreground }) => $foreground};
  background: ${({ $background }) => $background};
  box-shadow: 0 0.2rem 0.6rem color-mix(in srgb, ${({ $background }) => $background} 22%, transparent);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.03em;
  white-space: nowrap;
`;
