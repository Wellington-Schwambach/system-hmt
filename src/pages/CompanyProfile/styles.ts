import styled from 'styled-components';

const mobile = '720px';
const tablet = '1050px';

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.dashboardText};

  @media (max-width: ${mobile}) {
    padding: 0.85rem;
    gap: 0.9rem;
  }
`;

export const HeaderCard = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.35rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: ${mobile}) {
    align-items: flex-start;
    flex-direction: column;
    padding: 1rem;
  }
`;

export const HeaderIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.95rem;
  min-width: 0;
`;

export const CompanyIcon = styled.div`
  width: 3.25rem;
  height: 3.25rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
`;

export const HeaderText = styled.div`
  min-width: 0;

  h1 {
    margin: 0;
    font-size: clamp(1.15rem, 2.2vw, 1.55rem);
  }

  p {
    margin: 0.3rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.82rem;
    line-height: 1.45;
  }
`;

export const HeaderMeta = styled.div`
  display: grid;
  gap: 0.25rem;
  text-align: right;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;

  strong {
    color: ${({ theme }) => theme.colors.dashboardText};
    font-size: 0.9rem;
  }

  @media (max-width: ${mobile}) {
    width: 100%;
    text-align: left;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Section = styled.section`
  padding: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.2rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  @media (max-width: ${mobile}) {
    padding: 0.9rem;
    border-radius: 1rem;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: ${mobile}) {
    flex-direction: column;
  }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;

  > span {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    border-radius: 0.75rem;
    color: ${({ theme }) => theme.colors.brandGreen};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  }

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: ${tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label<{ $span?: 2 | 3 }>`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
  grid-column: ${({ $span }) => ($span ? `span ${$span}` : 'auto')};
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  font-weight: 700;

  @media (max-width: ${tablet}) {
    grid-column: ${({ $span }) => ($span === 3 ? '1 / -1' : $span === 2 ? 'span 2' : 'auto')};
  }

  @media (max-width: ${mobile}) {
    grid-column: auto;
  }
`;

const inputBase = `
  width: 100%;
  min-height: 2.85rem;
  padding: 0.68rem 0.8rem;
  border-radius: 0.8rem;
  outline: none;
  font: inherit;
  font-weight: 500;
  transition: border-color 120ms ease, box-shadow 120ms ease;
`;

export const Input = styled.input`
  ${inputBase}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Select = styled.select`
  ${inputBase}
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Textarea = styled.textarea`
  ${inputBase}
  min-height: 7rem;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: ${tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const DocumentCard = styled.article<{ $removed?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
  opacity: ${({ $removed }) => ($removed ? 0.55 : 1)};
`;

export const DocumentTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
`;

export const DocumentIcon = styled.span`
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.brandGreen};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const DocumentInfo = styled.div`
  min-width: 0;
  flex: 1;

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 0.82rem;
  }

  span {
    margin-top: 0.2rem;
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    font-size: 0.7rem;
  }
`;

export const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.65rem;
  padding: 0.65rem 0.8rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  input {
    display: none;
  }
`;

export const DocumentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'ghost' }>`
  min-height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.62rem 0.9rem;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'primary'
        ? theme.colors.brandGreen
        : $variant === 'danger'
          ? theme.colors.dangerBorder
          : theme.colors.dashboardBorder};
  border-radius: 0.8rem;
  color: ${({ $variant, theme }) =>
    $variant === 'primary' ? '#fff' : $variant === 'danger' ? theme.colors.danger : theme.colors.dashboardText};
  background: ${({ $variant, theme }) =>
    $variant === 'primary'
      ? theme.colors.brandGreen
      : $variant === 'danger'
        ? theme.colors.dangerSoft
        : theme.colors.dashboardSurface};
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const EmptyDocuments = styled.div`
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  min-height: 8rem;
  padding: 1rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  text-align: center;
  font-size: 0.78rem;
`;

export const HelperText = styled.p`
  margin: 0.8rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;
  line-height: 1.45;
`;

export const ActionBar = styled.div`
  position: sticky;
  bottom: 0.75rem;
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.surfaceElevated} 94%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 0.65rem 1.8rem rgba(15, 36, 23, 0.08);

  @media (max-width: ${mobile}) {
    bottom: 0.4rem;

    ${Button} {
      width: 100%;
    }
  }
`;

export const LoadingState = styled.div`
  min-height: 15rem;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
`;
