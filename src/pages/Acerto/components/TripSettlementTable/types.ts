import type { SettlementTravelRecord } from '../../types';

export interface TripSettlementTableProps {
  travels: SettlementTravelRecord[];
  totalOriginalNetFreight: number;
  totalNetFreight: number;
}
