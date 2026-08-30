import styled from 'styled-components';

import { breakpoints } from '../../../../styles/breakpoints';

export const FormCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
  overflow: hidden;
`;

export const FormIntro = styled.div`
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    padding: 1rem;
  }
`;

export const FormTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1.05rem;
`;

export const FormDescription = styled.p`
  margin: 0.3rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.78rem;
  line-height: 1.5;
`;

export const EditingBadge = styled.span`
  flex: 0 0 auto;
  padding: 0.4rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
  font-size: 0.7rem;
  font-weight: 800;
`;

export const Form = styled.form`
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
`;

export const Section = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const SectionLegend = styled.legend`
  padding: 0 0.45rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.82rem;
  font-weight: 850;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const NotesDocumentGrid = styled.div`
  min-width: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
  gap: 0.9rem;
  margin-top: 0.9rem;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: minmax(0, 1fr);
  }

  > * {
    min-width: 0;
    max-width: 100%;
  }
`;

export const Field = styled.div<{ $fullWidth?: boolean }>`
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.42rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: 800;
`;

export const InputShell = styled.div`
  position: relative;
  min-width: 0;
`;

export const FieldIcon = styled.span`
  position: absolute;
  left: 0.78rem;
  top: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.brandGreen};
  transform: translateY(-50%);
  pointer-events: none;
`;

const inputStyles = `
  width: 100%;
  min-height: 3rem;
  border-radius: 0.82rem;
  outline: none;
`;

export const Input = styled.input<{ $withIcon?: boolean }>`
  ${inputStyles}
  padding: ${({ $withIcon }) => ($withIcon ? '0.7rem 0.8rem 0.7rem 2.55rem' : '0.7rem 0.8rem')};
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};

  &::placeholder {
    color: ${({ theme }) => theme.colors.dashboardTextSoft};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const Select = styled.select<{ $withIcon?: boolean }>`
  ${inputStyles}
  padding: ${({ $withIcon }) =>
    $withIcon ? '0.7rem 2rem 0.7rem 2.55rem' : '0.7rem 2rem 0.7rem 0.8rem'};
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 9.2rem;
  resize: vertical;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.82rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const DocumentCard = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 100%;
  min-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px dashed ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.9rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const DocumentTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.78rem;
  font-weight: 850;
`;

export const FileInput = styled.input`
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.72rem;

  &::file-selector-button {
    min-height: 2.4rem;
    margin-right: 0.65rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid ${({ theme }) => theme.colors.brandGreenBorder};
    border-radius: 0.65rem;
    color: ${({ theme }) => theme.colors.brandGreenDark};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
    font-weight: 800;
    cursor: pointer;
  }

  @media (max-width: ${breakpoints.mobile}) {
    font-size: 0;

    &::file-selector-button {
      width: 100%;
      max-width: 100%;
      margin-right: 0;
      font-size: 0.72rem;
    }
  }
`;

export const ExistingFile = styled.div`
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.72rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  font-size: 0.72rem;

  @media (max-width: ${breakpoints.mobile}) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const FileName = styled.span`
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RemoveFileButton = styled.button`
  flex: 0 0 auto;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.55rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
`;

export const HelperText = styled.small`
  display: block;
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.67rem;
  line-height: 1.4;
`;

export const ErrorMessage = styled.div`
  padding: 0.75rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
  border-radius: 0.8rem;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerSoft};
  font-size: 0.78rem;
  font-weight: 750;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.25rem;

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

export const SecondaryButton = styled.button`
  min-height: 2.9rem;
  padding: 0.65rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.82rem;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
  }
`;

export const PrimaryButton = styled.button`
  min-height: 2.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.82rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
  box-shadow: ${({ theme }) => theme.shadow.green};
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  @media (max-width: ${breakpoints.mobile}) {
    width: 100%;
  }
`;
