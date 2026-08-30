import styled from 'styled-components';

import { breakpoints } from '../../styles/breakpoints';

export const Root = styled.div`
  position: relative;
  min-width: 0;
`;

export const Control = styled.div<{ $open: boolean; $disabled: boolean }>`
  min-height: 3rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.55rem 0 0.78rem;
  border: 1px solid
    ${({ $open, theme }) => ($open ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong)};
  border-radius: 0.82rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ $open, theme }) =>
    $open ? `0 0 0 0.2rem ${theme.colors.brandGreenFocus}` : 'none'};
  opacity: ${({ $disabled }) => ($disabled ? 0.62 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'text')};
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
`;

export const SearchIconBox = styled.span`
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};

  .select-loading-icon {
    animation: searchable-select-spin 0.8s linear infinite;
  }

  @keyframes searchable-select-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const SearchInput = styled.input`
  min-width: 0;
  flex: 1;
  height: 2.8rem;
  padding: 0;
  border: 0;
  outline: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: transparent;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 650;

  &::placeholder {
    color: ${({ theme }) => theme.colors.dashboardTextSoft};
    font-weight: 500;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 0.58rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;
  transition:
    color 140ms ease,
    background 140ms ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 0.15rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: 0.05rem;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Chevron = styled.span<{ $open: boolean }>`
  display: grid;
  place-items: center;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 160ms ease;
`;

export const Dropdown = styled.div`
  position: absolute;
  z-index: 12050;
  top: calc(100% + 0.42rem);
  left: 0;
  right: 0;
  min-width: 0;
  padding: 0.42rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};

  @media (max-width: ${breakpoints.mobile}) {
    max-width: calc(100vw - 2rem);
  }
`;

export const ResultsMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.35rem 0.45rem 0.5rem;
  color: ${({ theme }) => theme.colors.dashboardTextSoft};
  font-size: 0.66rem;
  font-weight: 700;
`;

export const OptionsList = styled.div`
  max-height: 15.5rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 0.12rem;
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

export const OptionButton = styled.button<{ $active: boolean; $selected: boolean }>`
  width: 100%;
  min-height: 2.65rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.55rem 0.65rem;
  border: 0;
  border-radius: 0.68rem;
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.brandGreenDark : theme.colors.dashboardText};
  background: ${({ $active, $selected, theme }) =>
    $active || $selected ? theme.colors.brandGreenSoft : 'transparent'};
  font: inherit;
  font-size: 0.8rem;
  font-weight: ${({ $selected }) => ($selected ? 800 : 650)};
  text-align: left;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 0.15rem solid ${({ theme }) => theme.colors.brandGreenFocus};
    outline-offset: -0.1rem;
  }
`;

export const SelectedMark = styled.span`
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};
`;

export const EmptyState = styled.div`
  padding: 1rem 0.75rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  line-height: 1.45;
  text-align: center;
`;
