import styled from 'styled-components';

import type { FuelType } from '../../types';

export const Badge = styled.span<{ $type: FuelType }>`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid ${({ $type }) => ($type === 'DIESEL' ? '#b8e7cd' : '#b8d7ed')};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ $type }) => ($type === 'DIESEL' ? '#007b3d' : '#176b9c')};
  background: ${({ $type }) => ($type === 'DIESEL' ? '#e8f8ef' : '#edf7fd')};
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
`;
