import styled, { keyframes, type DefaultTheme } from 'styled-components';

import type { NotificationType } from './types';

const toastIn = keyframes`
  from { opacity: 0; transform: translate3d(1.5rem, -0.4rem, 0) scale(0.96); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
`;

const backdropIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: translateY(1rem) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const progress = keyframes`
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
`;

const getTypeColor = ({ $type, theme }: { $type: NotificationType; theme: DefaultTheme }) => {
  if ($type === 'success') return theme.colors.brandGreen;
  if ($type === 'error') return theme.colors.danger;
  if ($type === 'warning') return '#f59e0b';
  return theme.colors.primary;
};

export const ToastViewport = styled.div`
  position: fixed;
  z-index: 30000;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: min(27rem, calc(100vw - 2rem));
  gap: 0.75rem;
  pointer-events: none;
`;

export const ToastCard = styled.article<{ $type: NotificationType }>`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  overflow: hidden;
  padding: 1rem 1rem 1.05rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background:
    linear-gradient(135deg, ${({ theme }) => theme.colors.surfaceGlassStrong}, ${({ theme }) => theme.colors.surfaceGlass}),
    ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 1.25rem 3.5rem ${({ theme }) => theme.colors.shadow};
  backdrop-filter: blur(1.1rem) saturate(1.2);
  pointer-events: auto;
  animation: ${toastIn} 240ms cubic-bezier(0.2, 0.8, 0.2, 1);

  &::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0.24rem;
    background: ${getTypeColor};
    content: '';
  }
`;

export const ToastIcon = styled.div<{ $type: NotificationType }>`
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border-radius: 0.8rem;
  color: ${getTypeColor};
  background: color-mix(in srgb, ${getTypeColor} 13%, transparent);
`;

export const ToastContent = styled.div`
  min-width: 0;
`;

export const ToastTitle = styled.strong`
  display: block;
  padding-right: 0.5rem;
  font-size: 0.93rem;
  line-height: 1.25;
`;

export const ToastMessage = styled.p`
  margin: 0.3rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.84rem;
  line-height: 1.5;
`;

export const ToastDetails = styled.ul`
  display: grid;
  gap: 0.22rem;
  margin: 0.55rem 0 0;
  padding-left: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.79rem;
  line-height: 1.4;
`;

export const ToastClose = styled.button`
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  margin: -0.25rem -0.25rem 0 0;
  border: 0;
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    color: ${({ theme }) => theme.colors.dashboardText};
    background: ${({ theme }) => theme.colors.dashboardBorder};
  }
`;

export const ToastProgress = styled.div<{ $type: NotificationType; $duration: number }>`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 0.18rem;
  transform-origin: left center;
  background: ${getTypeColor};
  animation: ${progress} ${({ $duration }) => $duration}ms linear forwards;
`;

export const ConfirmBackdrop = styled.div`
  position: fixed;
  z-index: 31000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(0.42rem);
  animation: ${backdropIn} 180ms ease-out;
`;

export const ConfirmCard = styled.section`
  width: min(31rem, 100%);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.38);
  animation: ${modalIn} 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
`;

export const ConfirmBody = styled.div`
  display: grid;
  justify-items: center;
  padding: 1.75rem 1.65rem 1.35rem;
  text-align: center;
`;

export const ConfirmIcon = styled.div<{ $type: Exclude<NotificationType, 'success'> }>`
  display: grid;
  width: 3.6rem;
  height: 3.6rem;
  place-items: center;
  margin-bottom: 1rem;
  border-radius: 1.15rem;
  color: ${getTypeColor};
  background: color-mix(in srgb, ${getTypeColor} 13%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${getTypeColor} 24%, transparent);
`;

export const ConfirmTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.15rem;
  line-height: 1.3;
`;

export const ConfirmMessage = styled.p`
  margin: 0.65rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.9rem;
  line-height: 1.55;
`;

export const ConfirmDetails = styled.ul`
  width: 100%;
  margin: 0.9rem 0 0;
  padding: 0.75rem 0.9rem 0.75rem 1.8rem;
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  text-align: left;
  font-size: 0.82rem;
`;

export const ConfirmFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const ConfirmButton = styled.button<{ $primary?: boolean; $type?: Exclude<NotificationType, 'success'> }>`
  min-height: 2.65rem;
  padding: 0.65rem 1.1rem;
  border: 1px solid
    ${({ $primary, $type, theme }) =>
      $primary
        ? $type === 'error'
          ? theme.colors.danger
          : $type === 'warning'
            ? '#f59e0b'
            : theme.colors.primary
        : theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  color: ${({ $primary, theme }) => ($primary ? theme.colors.white : theme.colors.dashboardText)};
  background: ${({ $primary, $type, theme }) =>
    $primary
      ? $type === 'error'
        ? theme.colors.danger
        : $type === 'warning'
          ? '#d97706'
          : theme.colors.primary
      : theme.colors.surfaceElevated};
  font-weight: 750;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.04);
  }
`;
