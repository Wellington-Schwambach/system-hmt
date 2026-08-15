import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

interface SidebarStateProps {
  $isOpen: boolean;
  $isCollapsed: boolean;
}

interface CollapsedStateProps {
  $isCollapsed: boolean;
}

interface MenuStateProps extends CollapsedStateProps {
  $isActive: boolean;
}

interface GroupChevronProps extends CollapsedStateProps {
  $isOpen: boolean;
}

export const SidebarBackdrop = styled.button<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: ${breakpoints.tablet}) {
    position: fixed;
    inset: 0;
    z-index: 39;
    display: block;
    padding: 0;
    border: 0;
    background: rgba(12, 28, 18, 0.46);
    backdrop-filter: blur(0.16rem);
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
    transition:
      opacity 220ms ease,
      visibility 220ms ease;
  }
`;

export const SidebarContainer = styled.nav<SidebarStateProps>`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '100%' : '17.5rem')};
  height: calc(100vh - 2rem);
  height: calc(100dvh - 2rem);
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '0.8rem' : '1.25rem')};
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ $isCollapsed }) => ($isCollapsed ? '1.65rem' : '2rem')};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow: hidden;
  transition:
    width 220ms ease,
    padding 220ms ease,
    border-radius 220ms ease;

  &::after {
    content: '';
    position: absolute;
    right: -5rem;
    bottom: -6rem;
    width: 13rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    pointer-events: none;
  }

  @media (max-width: ${breakpoints.tablet}) {
    width: min(19rem, calc(100vw - 2rem));
    height: 100vh;
    height: 100dvh;
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 40;
    top: 0;
    padding: 1.25rem;
    border-radius: 0 2rem 2rem 0;
    transform: translateX(-105%);
    transition: transform 220ms ease;

    ${({ $isOpen }) =>
      $isOpen &&
      css`
        transform: translateX(0);
      `}
  }
`;

export const SidebarHeader = styled.div<CollapsedStateProps>`
  position: relative;
  z-index: 1;
  min-height: 5.75rem;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.tablet}) {
    justify-content: space-between;
  }
`;

export const Brand = styled(Link)<CollapsedStateProps>`
  min-width: 0;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '3.3rem' : '100%')};
  min-height: 3.3rem;
  display: grid;
  place-items: center;
  text-decoration: none;

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    justify-items: start;
  }
`;

export const BrandImage = styled.img<CollapsedStateProps>`
  grid-area: 1 / 1;
  display: block;
  width: min(100%, 13rem);
  height: auto;
  object-fit: contain;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  transform: ${({ $isCollapsed }) => ($isCollapsed ? 'scale(0.86)' : 'scale(1)')};
  pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'auto')};
  transition:
    opacity 160ms ease,
    transform 220ms ease;

  @media (max-width: ${breakpoints.tablet}) {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
`;

export const BrandCompact = styled.span<CollapsedStateProps>`
  grid-area: 1 / 1;
  width: 3.1rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.colors.brandGreen},
    ${({ theme }) => theme.colors.brandGreenDark}
  );
  box-shadow: ${({ theme }) => theme.shadow.green};
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 1 : 0)};
  transform: ${({ $isCollapsed }) => ($isCollapsed ? 'scale(1)' : 'scale(0.78)')};
  pointer-events: none;
  transition:
    opacity 160ms ease,
    transform 220ms ease;

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`;

export const CloseButton = styled.button`
  display: none;

  @media (max-width: ${breakpoints.tablet}) {
    flex: 0 0 auto;
    width: 2.4rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.md};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.dashboardSurface};
    cursor: pointer;
  }
`;

export const MenuList = styled.ul`
  position: relative;
  z-index: 1;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 1.25rem 0 0;
  padding: 0 0.15rem 0.6rem 0;
  overflow-x: hidden;
  overflow-y: auto;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.dashboardBorderStrong} transparent;

  &::-webkit-scrollbar {
    width: 0.35rem;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.dashboardBorderStrong};
  }
`;

export const MenuButton = styled.button<MenuStateProps>`
  width: 100%;
  min-height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  gap: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '0.8rem')};
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '0.45rem' : '0.55rem 0.7rem')};
  border: 0;
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenSoft : 'transparent'};
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease,
    padding 220ms ease,
    gap 220ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? 'translateY(-0.08rem)' : 'translateX(0.15rem)'};
  }

  &:focus-visible {
    outline: 0.18rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.1rem;
  }

  @media (max-width: ${breakpoints.tablet}) {
    justify-content: flex-start;
    gap: 0.8rem;
    padding: 0.55rem 0.7rem;
  }
`;

export const MenuIcon = styled.span<{ $isActive: boolean }>`
  flex: 0 0 auto;
  width: 2.25rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.white : theme.colors.brandGreen)};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreen : theme.colors.surfaceElevated};
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadow.green : 'none')};
`;

export const MenuLabel = styled.span<CollapsedStateProps>`
  min-width: 0;
  max-width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '12rem')};
  overflow: hidden;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: left;
  transform: ${({ $isCollapsed }) => ($isCollapsed ? 'translateX(-0.4rem)' : 'translateX(0)')};
  transition:
    max-width 220ms ease,
    opacity 150ms ease,
    transform 220ms ease;

  @media (max-width: ${breakpoints.tablet}) {
    max-width: 12rem;
    opacity: 1;
    transform: none;
  }
`;

export const GroupChevron = styled.span<GroupChevronProps>`
  flex: 0 0 auto;
  margin-left: auto;
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'grid')};
  place-items: center;
  opacity: 0.72;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 180ms ease;

  @media (max-width: ${breakpoints.tablet}) {
    display: grid;
  }
`;

export const SubmenuList = styled.ul<{ $isOpen: boolean }>`
  gap: 0.25rem;
  margin: ${({ $isOpen }) => ($isOpen ? '0.3rem 0 0.25rem' : '0')};
  padding: 0 0 0 2.95rem;
  max-height: ${({ $isOpen }) => ($isOpen ? '12rem' : '0')};
  overflow: hidden;
  list-style: none;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition:
    max-height 220ms ease,
    margin 180ms ease,
    opacity 140ms ease;
`;

export const SubmenuButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  min-height: 2.65rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.65rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreenSoft : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition:
    color 160ms ease,
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    transform: translateX(0.12rem);
  }

  &:focus-visible {
    outline: 0.16rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.08rem;
  }
`;

export const SubmenuIcon = styled.span<{ $isActive: boolean }>`
  flex: 0 0 auto;
  width: 1.85rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 0.65rem;
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.white : theme.colors.brandGreen)};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.brandGreen : theme.colors.surfaceElevated};
`;

export const SubmenuLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.86rem;
  font-weight: 700;
`;

export const SidebarFooter = styled.div<CollapsedStateProps>`
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding-top: 0.75rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`;

export const CollapseButton = styled.button<CollapsedStateProps>`
  width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  gap: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '0.6rem')};
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '0.55rem' : '0.65rem 0.8rem')};
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    gap 220ms ease,
    padding 220ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreen};
  }

  &:focus-visible {
    outline: 0.18rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.12rem;
  }
`;

export const CollapseLabel = styled.span<CollapsedStateProps>`
  max-width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '10rem')};
  overflow: hidden;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  white-space: nowrap;
  transition:
    max-width 220ms ease,
    opacity 150ms ease;
`;
