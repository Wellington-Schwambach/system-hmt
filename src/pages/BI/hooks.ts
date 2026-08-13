import { useCallback, useMemo, useState } from 'react';

import type { BIPeriod } from './types';
import {
  calculateMetrics,
  calculatePercentageDelta,
  getAvailableYears,
  getInitialPeriod,
  getMonthlyPerformance,
  getPreviousPeriod,
  getRecentActivities,
  getShipperPerformance,
  getVehiclePerformance,
  loadBIData,
} from './utils';

export function useBIData() {
  const [data, setData] = useState(loadBIData);
  const [period, setPeriod] = useState<BIPeriod>(() => getInitialPeriod(data));

  const availableYears = useMemo(() => getAvailableYears(data), [data]);
  const metrics = useMemo(() => calculateMetrics(data, period), [data, period]);
  const previousMetrics = useMemo(
    () => calculateMetrics(data, getPreviousPeriod(period)),
    [data, period],
  );
  const monthlyPerformance = useMemo(
    () => getMonthlyPerformance(data, period.year),
    [data, period.year],
  );
  const vehiclePerformance = useMemo(() => getVehiclePerformance(data, period), [data, period]);
  const shipperPerformance = useMemo(() => getShipperPerformance(data, period), [data, period]);
  const recentActivities = useMemo(() => getRecentActivities(data, period), [data, period]);

  const comparisons = useMemo(
    () => ({
      fuelInvestment: calculatePercentageDelta(
        metrics.fuelInvestment,
        previousMetrics.fuelInvestment,
      ),
      trips: calculatePercentageDelta(metrics.trips, previousMetrics.trips),
      netFreight: calculatePercentageDelta(metrics.netFreight, previousMetrics.netFreight),
      operationalResult: calculatePercentageDelta(
        metrics.operationalResult,
        previousMetrics.operationalResult,
      ),
    }),
    [metrics, previousMetrics],
  );

  const selectYear = useCallback((year: number) => {
    setPeriod((currentPeriod) => ({ ...currentPeriod, year }));
  }, []);

  const selectMonth = useCallback((month: number) => {
    setPeriod((currentPeriod) => ({ ...currentPeriod, month }));
  }, []);

  const refreshData = useCallback(() => {
    const nextData = loadBIData();
    setData(nextData);

    const years = getAvailableYears(nextData);
    setPeriod((currentPeriod) => ({
      year: years.includes(currentPeriod.year)
        ? currentPeriod.year
        : getInitialPeriod(nextData).year,
      month: currentPeriod.month,
    }));
  }, []);

  return {
    period,
    metrics,
    comparisons,
    availableYears,
    monthlyPerformance,
    vehiclePerformance,
    shipperPerformance,
    recentActivities,
    selectYear,
    selectMonth,
    refreshData,
  };
}
