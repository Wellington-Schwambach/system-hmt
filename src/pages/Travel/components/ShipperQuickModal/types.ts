import type { TravelOptionShipper } from '../../types';

export interface ShipperQuickModalProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<TravelOptionShipper | null>;
  onCreated: (shipper: TravelOptionShipper) => void;
}
