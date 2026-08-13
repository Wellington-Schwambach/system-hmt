import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const Panel = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.brandGreenDark},
    ${({ theme }) => theme.colors.brandGreen}
  );
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1rem;
`;

export const HeaderIcon = styled.span`
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.16);
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Section = styled.section<{ $wide?: boolean }>`
  min-width: 0;
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
  padding: 1rem;
  border-right: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  &:nth-child(3) {
    border-right: 0;
  }

  ${({ $wide }) => $wide && 'border-right: 0;'}

  @media (max-width: ${breakpoints.desktop}) {
    &:nth-child(2) {
      border-right: 0;
    }

    &:nth-child(3) {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-column: 1 / -1;
    border-right: 0;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const SummaryRow = styled.div<{ $strong?: boolean; $muted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.33rem 0;
  color: ${({ $muted, theme }) =>
    $muted ? theme.colors.dashboardTextMuted : theme.colors.dashboardText};
  font-size: 0.76rem;

  strong {
    color: ${({ $strong, theme }) =>
      $strong ? theme.colors.brandGreenDark : theme.colors.dashboardText};
    font-size: ${({ $strong }) => ($strong ? '0.92rem' : '0.78rem')};
    font-variant-numeric: tabular-nums;
  }
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
`;

export const Field = styled.div<{ $full?: boolean }>`
  min-width: 0;
  grid-column: ${({ $full }) => ($full ? '1 / -1' : 'auto')};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.32rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.65rem;
  font-weight: 800;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.55rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.72rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.78rem;
  font-weight: 700;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const BonusHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.55rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.72rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.66rem;
  line-height: 1.35;
`;

export const ApplyButton = styled.button`
  flex: 0 0 auto;
  padding: 0.35rem 0.5rem;
  border: 0;
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  font-size: 0.62rem;
  font-weight: 850;
  cursor: pointer;
`;

export const EntryGroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const EntryGroup = styled.div`
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const EntryGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-bottom: 0.45rem;
`;

export const EntryGroupTitle = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.73rem;
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.48rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: 0.6rem;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.64rem;
  font-weight: 850;
  cursor: pointer;
`;

export const EntryList = styled.div`
  display: grid;
  gap: 0.35rem;
`;

export const EntryItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.65rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const EntryCopy = styled.div`
  min-width: 0;

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.68rem;
  }

  span {
    margin-top: 0.12rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.6rem;
  }
`;

export const EntryValue = styled.strong`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const RemoveButton = styled.button`
  width: 1.7rem;
  height: 1.7rem;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  cursor: pointer;
`;

export const EmptyEntries = styled.div`
  padding: 0.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.65rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.64rem;
  text-align: center;
`;

export const TotalReceivable = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.dashboardText};

  span {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    color: #7ff0ad;
    font-size: clamp(1.45rem, 3vw, 2rem);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: ${breakpoints.mobile}) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }
`;
