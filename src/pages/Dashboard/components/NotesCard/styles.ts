import styled from 'styled-components';

export const Card = styled.article`
  min-width: 0;
  min-height: 20rem;
  padding: 1.15rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: 1.6rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadow.dashboard};
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
`;

export const HeaderIcon = styled.span`
  width: 2.5rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.brandGreen};
`;

export const HeaderTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 1rem;
`;

export const NotesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
`;

export const NoteItem = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dashboardBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.dashboardSurface};
`;

export const NoteIcon = styled.span`
  width: 2.3rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.brandGreenDark};
  background: ${({ theme }) => theme.colors.brandGreenSoft};
`;

export const NoteText = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.dashboardText};
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.4;
`;

export const NoteTime = styled.time`
  color: ${({ theme }) => theme.colors.dashboardTextMuted};
  font-size: 0.75rem;
  font-weight: 800;
`;
