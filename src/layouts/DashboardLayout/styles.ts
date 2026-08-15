import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

interface LayoutProps {
  $isSidebarCollapsed: boolean;
}

export const Layout = styled.div<LayoutProps>`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 5.75rem minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 92% 8%, rgba(0, 166, 81, 0.12), transparent 24rem),
    ${({ theme }) => theme.colors.dashboardBackground};

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }

  @media (max-width: ${breakpoints.mobile}) {
    padding: 0.6rem;
  }
`;

export const SidebarSlot = styled.aside`
  min-width: 0;
  position: relative;
  z-index: 1100;

  @media (max-width: ${breakpoints.tablet}) {
    position: static;
  }
`;

export const Main = styled.main`
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HeaderSlot = styled.header`
  min-width: 0;
  position: relative;
  z-index: 1000;
`;

export const Content = styled.section`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
