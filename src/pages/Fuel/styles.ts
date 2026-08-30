import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 28rem) {
    grid-template-columns: 1fr;
  }
`;

export const RecordsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 5rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1rem, 2vw, 1.2rem);
`;

export const SectionMeta = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
`;


export const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
  padding: 0.8rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PaginationSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  font-weight: 700;
`;

export const PageSizeSelect = styled.select`
  min-height: 2.2rem;
  padding: 0.35rem 1.7rem 0.35rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.72rem;
  font-weight: 750;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const PaginationActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;

  @media (max-width: ${breakpoints.mobile}) {
    justify-content: space-between;
  }
`;

export const PageButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;

  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }
`;

export const PageInfo = styled.span`
  min-width: 7.2rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.74rem;
  text-align: center;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }
`;

export const ModuleTabs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.3rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const ModuleTab = styled.button<{ $active: boolean }>`
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.8rem;
  border: 0;
  border-radius: 0.65rem;
  color: ${({ theme, $active }) => ($active ? theme.colors.brandGreenDark : theme.colors.dashboardTextMuted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.brandGreenSoft : 'transparent')};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
`;

export const HistoryList = styled.div`
  display: grid;
  gap: 0.7rem;
`;

export const HistoryCard = styled.article`
  display: grid;
  grid-template-columns: minmax(8rem, 0.8fr) minmax(10rem, 1.2fr) minmax(12rem, 1.5fr) auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const HistoryItem = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.73rem;

  strong { display: block; margin-bottom: 0.15rem; color: ${({ theme }) => theme.colors.dashboardText}; font-size: 0.8rem; }
`;

export const RestoreButton = styled.button`
  min-height: 2.35rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font: inherit;
  font-size: 0.74rem;
  font-weight: 800;
  cursor: pointer;
`;
