import styled from 'styled-components';

export const Page = styled.div`
  min-width: 0;
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const TitleGroup = styled.div`
  display: grid;
  gap: 0.35rem;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: clamp(1.4rem, 2.4vw, 2rem);
`;

export const Subtitle = styled.p`
  max-width: 52rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  line-height: 1.55;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'primary'
        ? theme.colors.brandGreen
        : $variant === 'danger'
          ? theme.colors.dangerBorder
          : theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ $variant, theme }) =>
    $variant === 'primary'
      ? theme.colors.white
      : $variant === 'danger'
        ? theme.colors.danger
        : theme.colors.dashboardText};
  background: ${({ $variant, theme }) =>
    $variant === 'primary'
      ? theme.colors.brandGreen
      : $variant === 'danger'
        ? theme.colors.dangerSoft
        : theme.colors.dashboardSurface};
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

export const Tabs = styled.nav`
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  min-width: max-content;
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.dashboardTextMuted};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.brandGreen : 'transparent'};
  font-weight: 750;
  cursor: pointer;
`;

export const PolicyGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11.5rem, 1fr));
  gap: 0.75rem;
`;

export const PolicyCard = styled.article`
  display: grid;
  gap: 0.2rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const PolicyValue = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.35rem;
`;

export const PolicyLabel = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.84rem;
`;

export const Section = styled.section`
  min-width: 0;
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.08rem;
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.86rem;
  line-height: 1.5;
`;

export const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 0.8rem;
`;

export const UserCard = styled.article`
  display: grid;
  gap: 0.75rem;
  padding: 0.95rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const UserCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const UserIdentity = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.18rem;
`;

export const UserName = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  overflow-wrap: anywhere;
`;

export const UserMeta = styled.span`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.84rem;
  overflow-wrap: anywhere;
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  height: fit-content;
  display: inline-flex;
  padding: 0.28rem 0.55rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.brandGreenDark : theme.colors.danger};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.brandGreenSoft : theme.colors.dangerSoft};
  font-size: 0.75rem;
  font-weight: 800;
`;

export const DetailList = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 0.7rem;
  margin: 0;
  font-size: 0.82rem;

  dt {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
  }

  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-weight: 650;
  }
`;

export const TableWrap = styled.div`
  max-width: 100%;
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
    color: ${({ theme }) => theme.colors.dashboardText};
    text-align: left;
    font-size: 0.84rem;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.74rem;
    text-transform: uppercase;
  }
`;

export const ResultBadge = styled.span<{ $success: boolean }>`
  display: inline-flex;
  padding: 0.26rem 0.5rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $success, theme }) =>
    $success ? theme.colors.brandGreenDark : theme.colors.danger};
  background: ${({ $success, theme }) =>
    $success ? theme.colors.brandGreenSoft : theme.colors.dangerSoft};
  font-weight: 750;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
`;

export const ErrorBox = styled.div`
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-weight: 700;
`;

export const SuccessBox = styled.div`
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-weight: 700;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(0.16rem);
  overscroll-behavior: contain;
`;

export const Modal = styled.form`
  width: min(58rem, 100%);
  max-height: calc(100vh - 2rem);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const ModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const ModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.2rem;
`;

export const IconButton = styled.button`
  width: 2.4rem;
  height: 2.4rem;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  cursor: pointer;
`;

export const ModalBody = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
`;

export const FormSection = styled.fieldset`
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0.95rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};

  legend {
    padding: 0 0.35rem;
    color: ${({ theme }) => theme.colors.dashboardText};
    font-weight: 800;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 42rem) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.82rem;
  font-weight: 750;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Select = styled.select`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const PasswordWrap = styled.div`
  position: relative;

  input {
    padding-right: 3rem;
  }

  button {
    position: absolute;
    top: 50%;
    right: 0.35rem;
    transform: translateY(-50%);
  }
`;

export const ToggleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-weight: 700;
  cursor: pointer;
`;

export const Days = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

export const DayButton = styled.button<{ $selected: boolean }>`
  min-width: 2.5rem;
  min-height: 2.35rem;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.brandGreen : theme.colors.dashboardBorderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.white : theme.colors.dashboardTextMuted};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.brandGreen : theme.colors.dashboardBackground};
  font-weight: 750;
  cursor: pointer;
`;

export const PermissionGroups = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.7rem;
`;

export const PermissionGroup = styled.div`
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const PermissionGroupTitle = styled.strong`
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.86rem;
`;

export const PermissionOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.82rem;
  line-height: 1.35;
`;

export const ModalFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const WeekendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
  }
`;

export const WeekendCard = styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const WeekendHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }
`;

export const BlockActionGroup = styled.div`
  min-width: 15rem;
  display: grid;
  grid-template-columns: minmax(7rem, 1fr) auto;
  align-items: center;
  gap: 0.5rem;

  select {
    min-height: 2.65rem;
  }

  @media (max-width: 40rem) {
    grid-template-columns: 1fr;
  }
`;


export const BlockReason = styled.div`
  display: grid;
  gap: 0.2rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
  }

  small {
    max-width: 24rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    line-height: 1.35;
  }
`;
