import { useCallback, useEffect, useState } from 'react';

import { getApiErrorFeedback } from '../../utils/apiError';
import { biService } from './services';
import type { BIOperationalData, BIPeriod } from './types';

const now = new Date();
const EMPTY_DATA: BIOperationalData = {
  period: { year: now.getFullYear(), month: now.getMonth() + 1 },
  availableYears: [now.getFullYear()],
  metrics: {
    fuelInvestment: 0,
    dieselLiters: 0,
    arlaLiters: 0,
    fuelings: 0,
    trips: 0,
    grossFreight: 0,
    netFreight: 0,
    freightDifference: 0,
    operationalResult: 0,
    averageFreight: 0,
    averageFuelTicket: 0,
  },
  comparisons: {
    fuelInvestment: 0,
    trips: 0,
    netFreight: 0,
    operationalResult: 0,
  },
  monthlyPerformance: [],
  vehiclePerformance: [],
  shipperPerformance: [],
  recentActivities: [],
};

export function useBIData() {
  const [data, setData] = useState<BIOperationalData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async (period?: BIPeriod) => {
    setLoading(true);
    setError('');

    try {
      const response = await biService.operational(period);
      setData(response);
    } catch (requestError) {
      const feedback = getApiErrorFeedback(
        requestError,
        'Não foi possível carregar os dados do BI Operacional diretamente do banco.',
      );
      setError(feedback.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectYear = useCallback((year: number) => {
    void loadData({ year, month: data.period.month });
  }, [data.period.month, loadData]);

  const selectMonth = useCallback((month: number) => {
    void loadData({ year: data.period.year, month });
  }, [data.period.year, loadData]);

  const refreshData = useCallback(() => {
    void loadData(data.period);
  }, [data.period, loadData]);

  return {
    period: data.period,
    metrics: data.metrics,
    comparisons: data.comparisons,
    availableYears: data.availableYears,
    monthlyPerformance: data.monthlyPerformance,
    vehiclePerformance: data.vehiclePerformance,
    shipperPerformance: data.shipperPerformance,
    recentActivities: data.recentActivities,
    loading,
    error,
    selectYear,
    selectMonth,
    refreshData,
  };
}
