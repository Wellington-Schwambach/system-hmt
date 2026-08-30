import styled from 'styled-components';

export const UserButton = styled.button<{ $open: boolean }>`
  position: relative;
  width: 2.9rem;
  height: 2.9rem;

  @media (max-width: 36rem) {
    width: 2.65rem;
    height: 2.65rem;
  }
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow:
    0 0 0 ${({ $open }) => ($open ? '2px' : '1px')}
      ${({ $open, theme }) =>
        $open ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong},
    0 0.3rem 0.8rem rgba(15, 23, 42, 0.12);
  cursor: pointer;
  overflow: visible;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.brandGreenSoft},
      0 0.4rem 1rem rgba(15, 23, 42, 0.16);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 3px;
  }
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
`;

export const AvatarInitials = styled.span`
  font-size: 0.8rem;
  font-weight: 850;
  letter-spacing: 0.02em;
`;

export const OnlineIndicator = styled.span`
  position: absolute;
  right: -0.05rem;
  bottom: 0.05rem;
  width: 0.7rem;
  height: 0.7rem;
  border: 2px solid ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
`;

export const LargeAvatar = styled.div`
  width: 2.8rem;
  height: 2.8rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
  overflow: hidden;
`;

export const UserCopy = styled.div`
  min-width: 0;
  flex: 1;
`;

export const UserName = styled.strong`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.88rem;
  font-weight: 800;
`;

export const UserRole = styled.span`
  display: block;
  margin-top: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.73rem;
`;
