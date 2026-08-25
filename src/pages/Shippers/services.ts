import { api } from '../../services/api';
import type { ShipperFormData, ShipperRecord } from './types';

interface ApiShipper {
  id: number;
  name: string;
  display_color: string;
  status: ShipperRecord['status'];
  travels_count: number;
  created_at: string;
  updated_at: string;
}

function mapShipper(shipper: ApiShipper): ShipperRecord {
  return {
    id: shipper.id,
    name: shipper.name,
    displayColor: shipper.display_color,
    status: shipper.status,
    travelsCount: Number(shipper.travels_count ?? 0),
    createdAt: shipper.created_at,
    updatedAt: shipper.updated_at,
  };
}

export const shipperService = {
  async list(): Promise<ShipperRecord[]> {
    const response = await api.get<{ shippers: ApiShipper[] }>('/api/shippers');
    return response.data.shippers.map(mapShipper);
  },

  async create(data: ShipperFormData): Promise<{ message: string; shipper: ShipperRecord }> {
    const response = await api.post<{ message: string; shipper: ApiShipper }>('/api/shippers', {
      name: data.name,
      display_color: data.displayColor,
      status: data.status,
    });
    return { message: response.data.message, shipper: mapShipper(response.data.shipper) };
  },

  async update(id: number, data: ShipperFormData): Promise<{ message: string; shipper: ShipperRecord }> {
    const response = await api.put<{ message: string; shipper: ApiShipper }>(`/api/shippers/${id}`, {
      name: data.name,
      display_color: data.displayColor,
      status: data.status,
    });
    return { message: response.data.message, shipper: mapShipper(response.data.shipper) };
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/shippers/${id}`);
  },
};
