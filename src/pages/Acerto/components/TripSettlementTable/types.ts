import type { TravelRecord } from '../../../Travel/types';

export interface TripSettlementTableProps {
  travels: TravelRecord[];
  totalNetFreight: number;
}
