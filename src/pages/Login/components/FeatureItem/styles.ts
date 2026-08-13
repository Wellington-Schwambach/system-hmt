import styled from 'styled-components';

export const FeatureContainer = styled.article`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
`;

export const FeatureIcon = styled.div`
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.8rem;
  color: #c9f7dc;
  background: rgba(0, 166, 81, 0.26);
  backdrop-filter: blur(0.55rem);
`;

export const FeatureContent = styled.div`
  display: grid;
  gap: 0.35rem;
`;

export const FeatureTitle = styled.strong`
  font-size: 0.98rem;
`;

export const FeatureDescription = styled.p`
  margin: 0;
  max-width: 11rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.82rem;
  line-height: 1.5;
`;
