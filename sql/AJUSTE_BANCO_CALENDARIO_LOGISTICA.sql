-- Calendário de Cargas - otimização da consulta por data de carregamento.
-- As cargas continuam sendo armazenadas em logistics_loads. Não há duplicação de dados.
CREATE INDEX IF NOT EXISTS logistics_loads_calendar_loading_shipper_idx
    ON logistics_loads (loading_at, shipper_id, completed_at);
