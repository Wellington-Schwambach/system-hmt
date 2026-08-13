import type { VehicleTab } from '../../types';

export interface VehicleTabsProps {
  activeTab: VehicleTab;
  vehicleCount: number;
  onChange: (tab: VehicleTab) => void;
}
