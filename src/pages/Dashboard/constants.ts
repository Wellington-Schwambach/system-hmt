import { Banknote, Fuel, Gauge } from 'lucide-react';

import type { DashboardMetric } from './types';

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    id: 'values',
    title: 'Valores',
    value: 'R$ 128,4 mil',
    caption: 'indicador geral',
    icon: Banknote,
  },
  {
    id: 'data',
    title: 'Dados',
    value: '1.284',
    caption: 'registros processados',
    icon: Gauge,
  },
  {
    id: 'fuel',
    title: 'Combustível',
    value: '8.760 L',
    caption: 'Clique para acessar os abastecimentos',
    icon: Fuel,
    path: '/fuel',
  },
];

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
