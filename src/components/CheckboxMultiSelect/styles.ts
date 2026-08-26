import styled from 'styled-components';

export const Shell = styled.div`
  position: relative;
  min-width: 0;
`;

export const Trigger = styled.button<{ $open: boolean }>`
  width: 100%;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid ${({ $open, theme }) => ($open ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong)};
  border-radius: 0.85rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ $open, theme }) => ($open ? `0 0 0 0.2rem ${theme.colors.brandGreenFocus}` : 'none')};
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'none')};
    transition: transform 150ms ease;
  }
`;

export const Summary = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Dropdown = styled.div`
  position: absolute;
  z-index: 1600;
  top: calc(100% + 0.4rem);
  left: 0;
  width: max(100%, 15rem);
  max-width: min(22rem, 92vw);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const SearchBox = styled.div`
  position: relative;
  padding: 0.55rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 1.2rem;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  pointer-events: none;
`;

export const SearchInput = styled.input`
  width: 100%;
  min-height: 2.3rem;
  padding: 0.5rem 2rem 0.5rem 2.2rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font: inherit;
  font-size: 0.76rem;

  &:focus { border-color: ${({ theme }) => theme.colors.brandGreen}; }
`;

export const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 1rem;
  width: 1.7rem;
  height: 1.7rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: transparent;
  cursor: pointer;
`;

export const Checkbox = styled.span<{ $checked: boolean }>`
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid ${({ $checked, theme }) => ($checked ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong)};
  border-radius: 0.3rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ $checked, theme }) => ($checked ? theme.colors.brandGreen : 'transparent')};
`;

export const AllButton = styled.button<{ $checked: boolean }>`
  width: 100%;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ $checked, theme }) => ($checked ? theme.colors.brandGreenSoft : theme.colors.surfaceElevated)};
  font: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
`;

export const OptionList = styled.div`
  max-height: 17rem;
  overflow-y: auto;
  padding: 0.3rem;
`;

export const OptionButton = styled.button`
  width: 100%;
  min-height: 2.35rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.48rem 0.5rem;
  border: 0;
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: transparent;
  font: inherit;
  font-size: 0.76rem;
  text-align: left;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.brandGreenSoft}; }
`;

export const Empty = styled.div`
  padding: 1rem 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.74rem;
  text-align: center;
`;
