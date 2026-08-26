import { api } from '../../services/api';
import type { ShipperDocumentRecord, ShipperFormData, ShipperRecord } from './types';

interface ApiShipperDocument {
  id: number;
  name: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number;
  position: number;
  created_at: string;
  updated_at: string;
}

interface ApiShipper {
  id: number;
  name: string;
  display_color: string;
  receipt_term_days: number | null;
  status: ShipperRecord['status'];
  travels_count: number;
  documents: ApiShipperDocument[];
  created_at: string;
  updated_at: string;
}

function mapDocument(document: ApiShipperDocument): ShipperDocumentRecord {
  return {
    id: document.id,
    name: document.name,
    originalName: document.original_name,
    mimeType: document.mime_type,
    sizeBytes: Number(document.size_bytes ?? 0),
    position: Number(document.position ?? 0),
    createdAt: document.created_at,
    updatedAt: document.updated_at,
  };
}

function mapShipper(shipper: ApiShipper): ShipperRecord {
  return {
    id: shipper.id,
    name: shipper.name,
    displayColor: shipper.display_color,
    receiptTermDays: shipper.receipt_term_days === null ? null : Number(shipper.receipt_term_days),
    status: shipper.status,
    travelsCount: Number(shipper.travels_count ?? 0),
    documents: (shipper.documents ?? []).map(mapDocument),
    createdAt: shipper.created_at,
    updatedAt: shipper.updated_at,
  };
}

function payload(data: ShipperFormData) {
  return {
    name: data.name,
    display_color: data.displayColor,
    receipt_term_days: data.receiptTermDays.trim() === '' ? null : Number(data.receiptTermDays),
    status: data.status,
  };
}

export const shipperService = {
  async list(): Promise<ShipperRecord[]> {
    const response = await api.get<{ shippers: ApiShipper[] }>('/api/shippers');
    return response.data.shippers.map(mapShipper);
  },

  async create(data: ShipperFormData): Promise<{ message: string; shipper: ShipperRecord }> {
    const response = await api.post<{ message: string; shipper: ApiShipper }>('/api/shippers', payload(data));
    return { message: response.data.message, shipper: mapShipper(response.data.shipper) };
  },

  async update(id: number, data: ShipperFormData): Promise<{ message: string; shipper: ShipperRecord }> {
    const response = await api.put<{ message: string; shipper: ApiShipper }>(`/api/shippers/${id}`, payload(data));
    return { message: response.data.message, shipper: mapShipper(response.data.shipper) };
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/shippers/${id}`);
  },

  async uploadDocument(shipperId: number, name: string, file: File): Promise<ShipperDocumentRecord> {
    const form = new FormData();
    form.append('name', name);
    form.append('file', file);
    const response = await api.post<{ document: ApiShipperDocument }>(
      `/api/shippers/${shipperId}/documents`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return mapDocument(response.data.document);
  },

  async renameDocument(shipperId: number, documentId: number, name: string): Promise<void> {
    await api.put(`/api/shippers/${shipperId}/documents/${documentId}`, { name });
  },

  async removeDocument(shipperId: number, documentId: number): Promise<void> {
    await api.delete(`/api/shippers/${shipperId}/documents/${documentId}`);
  },

  async downloadDocument(shipperId: number, document: ShipperDocumentRecord): Promise<void> {
    const response = await api.get<Blob>(`/api/shippers/${shipperId}/documents/${document.id}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = document.originalName || document.name;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
