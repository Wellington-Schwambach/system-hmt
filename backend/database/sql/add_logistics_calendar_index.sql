-- Otimização da consulta mensal do Calendário de Cargas.
CREATE INDEX IF NOT EXISTS logistics_loads_calendar_loading_shipper_idx
    ON logistics_loads (loading_at, shipper_id, completed_at);
