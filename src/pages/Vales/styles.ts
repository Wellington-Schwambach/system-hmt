import styled from 'styled-components';

export const Page = styled.main`
  display: grid;
  gap: 18px;
  padding-bottom: 32px;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const TitleGroup = styled.div`
  display: grid;
  gap: 4px;
`;

export const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.brandGreen};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(24px, 3vw, 34px);
`;

export const Subtitle = styled.p`
  max-width: 720px;
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  line-height: 1.55;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brandGreen};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 800;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.brandGreenDark};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.article`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: 0 8px 24px rgba(18, 42, 29, 0.05);

  span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    display: block;
    margin-top: 5px;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 22px;
  }
`;

export const Panel = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const Tabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.brandGreenBorder : theme.colors.dashboardBorder)};
  border-radius: 9px;
  background: ${({ theme, $active }) => ($active ? theme.colors.brandGreenSoft : theme.colors.dashboardSurface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.brandGreenDark : theme.colors.dashboardText)};
  font-weight: 800;
  cursor: pointer;
`;

export const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1.3fr) minmax(145px, 0.65fr) minmax(145px, 0.65fr) minmax(300px, 1fr) auto;
  align-items: end;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;


export const FilterGroup = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  min-height: 38px;
  flex: 0 0 auto;
  padding: 0 13px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.brandGreen : theme.colors.dashboardBorder)};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.dashboardTextMuted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.brandGreen : theme.colors.surfaceElevated)};
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.brandGreenDark)};
    background: ${({ theme, $active }) => ($active ? theme.colors.brandGreenDark : theme.colors.brandGreenSoft)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }
`;

export const FilterField = styled.label`
  display: grid;
  gap: 6px;

  > span {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
`;

export const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.dashboardText};
  font: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Select = styled.select`
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.dashboardText};
  font: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const TableWrap = styled.div`
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;

  th,
  td {
    padding: 11px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  td {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 13px;
  }
`;

export const Badge = styled.span<{ $tone: 'pending' | 'settled' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  background: ${({ $tone }) => ($tone === 'pending' ? '#fff5cf' : $tone === 'settled' ? '#e8f7ed' : '#eef2f0')};
  color: ${({ $tone }) => ($tone === 'pending' ? '#7b5c00' : $tone === 'settled' ? '#176b38' : '#43544a')};
  font-size: 11px;
  font-weight: 800;
`;

export const InvoiceButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.brandGreen};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenDark};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
`;

export const InvoicedLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  color: ${({ theme }) => theme.colors.brandGreenDark};
  font-size: 12px;
  font-weight: 800;
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

export const IconButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  color: ${({ theme }) => theme.colors.dashboardText};
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandGreen};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const Empty = styled.div`
  padding: 36px 16px;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const Overlay = styled.div`
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(12, 22, 16, 0.48);
`;

export const Modal = styled.div`
  box-sizing: border-box;
  width: min(560px, calc(100vw - 40px));
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 20px;
  }
`;

export const Form = styled.form`
  box-sizing: border-box;
  display: grid;
  gap: 14px;
  width: 100%;
  min-width: 0;
  padding: 20px;

  > * {
    min-width: 0;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 12px;
  font-weight: 800;
`;

export const Textarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 86px;
  padding: 10px 11px;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.dashboardText};
  font: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const FormGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  > * {
    min-width: 0;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const SecondaryButton = styled.button`
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }
`;

export const HistoryList = styled.div`
  display: grid;
`;

export const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: 150px 130px 1fr 190px;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 13px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }
`;
