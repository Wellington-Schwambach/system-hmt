import styled from 'styled-components';

import type { FuelStatus } from '../../types';

const STATUS_COLORS: Record<FuelStatus, { text: string; background: string; border: string }> = {
  F: {
    text: '#007b3d',
    background: '#e8f8ef',
    border: '#b8e7cd',
  },
  N: {
    text: '#a23a3a',
    background: '#fff0f0',
    border: '#efc9c9',
  },
};

export const Badge = styled.span<{ $status: FuelStatus }>`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid ${({ $status }) => STATUS_COLORS[$status].border};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $status }) => STATUS_COLORS[$status].text};
  background: ${({ $status }) => STATUS_COLORS[$status].background};
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
`;

export const Dot = styled.span`
  width: 0.42rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: currentColor;
`;
