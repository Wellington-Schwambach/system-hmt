import styled, { css } from 'styled-components';

import type { VehicleStatus } from '../../types';

const statusStyles = {
  ACTIVE: css`
    color: ${({ theme }) => theme.colors.brandGreenDark};
    border-color: ${({ theme }) => theme.colors.brandGreenBorder};
    background: ${({ theme }) => theme.colors.brandGreenSoft};
  `,
  MAINTENANCE: css`
    color: #9a6200;
    border-color: #f0d49a;
    background: #fff8e8;
  `,
  INACTIVE: css`
    color: ${({ theme }) => theme.colors.dashboardTextMuted};
    border-color: ${({ theme }) => theme.colors.dashboardBorderStrong};
    background: ${({ theme }) => theme.colors.dashboardSurface};
  `,
};

export const Badge = styled.span<{ $status: VehicleStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 1.8rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;

  ${({ $status }) => statusStyles[$status]}
`;

export const Dot = styled.span`
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: currentColor;
`;
