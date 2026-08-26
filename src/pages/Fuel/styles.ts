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
