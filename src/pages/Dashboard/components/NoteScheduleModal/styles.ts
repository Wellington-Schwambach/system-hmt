import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2700;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(7, 18, 12, 0.62);
  backdrop-filter: blur(0.35rem);
`;

export const Modal = styled.section`
  width: min(29rem, 100%);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.28);
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const TitleWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

export const Icon = styled.span`
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.76rem;
  overflow-wrap: anywhere;
`;

export const CloseButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 0.7rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
  cursor: pointer;
`;

export const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 1.1rem;

  @media (max-width: 32rem) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.76rem;
  font-weight: 800;
`;

export const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 2.65rem;
  padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorderStrong};
  border-radius: 0.75rem;
  outline: none;
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  font: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.brandGreen};
    box-shadow: 0 0 0 0.18rem ${({ theme }) => theme.colors.brandGreenFocus};
  }
`;

export const Actions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  padding-top: 0.2rem;
`;

const ButtonBase = styled.button`
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 0.85rem;
  border-radius: 0.75rem;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 850;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const SecondaryButton = styled(ButtonBase)`
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  color: ${({ theme }) => theme.colors.dashboardText};
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const PrimaryButton = styled(ButtonBase)`
  border: 1px solid ${({ theme }) => theme.colors.brandGreen};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;
