import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { PageLoader } from '../components/PageLoader';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AdministratorRoute } from './components/AdministratorRoute';
import { HomeRedirect } from './components/HomeRedirect';
import { PermissionRoute } from './components/PermissionRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

const Login = lazy(() => import('../pages/Login').then((module) => ({ default: module.Login })));
const Dashboard = lazy(() =>
  import('../pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const BI = lazy(() => import('../pages/BI').then((module) => ({ default: module.BI })));
const Fuel = lazy(() => import('../pages/Fuel').then((module) => ({ default: module.Fuel })));
const Travel = lazy(() =>
  import('../pages/Travel').then((module) => ({ default: module.Travel })),
);
const Acerto = lazy(() =>
  import('../pages/Acerto').then((module) => ({ default: module.Acerto })),
);
const Finance = lazy(() =>
  import('../pages/Finance').then((module) => ({ default: module.Finance })),
);
const Maintenance = lazy(() =>
  import('../pages/Maintenance').then((module) => ({ default: module.Maintenance })),
);
const Logistic = lazy(() =>
  import('../pages/Logistic').then((module) => ({ default: module.Logistic })),
);
const Vehicles = lazy(() =>
  import('../pages/Vehicles').then((module) => ({ default: module.Vehicles })),
);
const Employees = lazy(() =>
  import('../pages/Employees').then((module) => ({ default: module.Employees })),
);
const Shippers = lazy(() =>
  import('../pages/Shippers').then((module) => ({ default: module.Shippers })),
);
const Security = lazy(() =>
  import('../pages/Security').then((module) => ({ default: module.Security })),
);
const AccessDenied = lazy(() =>
  import('../pages/AccessDenied').then((module) => ({ default: module.AccessDenied })),
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/sem-acesso" element={<AccessDenied />} />

              <Route element={<PermissionRoute permission="dashboard" />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route element={<PermissionRoute permission="bi" />}>
                <Route path="/bi" element={<BI />} />
              </Route>
              <Route element={<PermissionRoute permission="fuel" />}>
                <Route path="/fuel" element={<Fuel />} />
              </Route>
              <Route element={<PermissionRoute permission="travel" />}>
                <Route path="/travel" element={<Travel />} />
              </Route>
              <Route element={<PermissionRoute permission="settlements" />}>
                <Route path="/acertos" element={<Acerto />} />
              </Route>
              <Route element={<PermissionRoute permission="finance" />}>
                <Route path="/finance" element={<Finance />} />
              </Route>
              <Route element={<PermissionRoute permission="maintenance" />}>
                <Route path="/maintenance" element={<Maintenance />} />
              </Route>
              <Route element={<PermissionRoute permission="logistics" />}>
                <Route path="/logistic" element={<Logistic />} />
              </Route>
              <Route element={<PermissionRoute permission="registrations.vehicles" />}>
                <Route path="/cadastros/veiculos" element={<Vehicles />} />
              </Route>
              <Route element={<PermissionRoute permission="registrations.employees" />}>
                <Route path="/cadastros/colaboradores" element={<Employees />} />
              </Route>
              <Route element={<PermissionRoute permission="registrations.shippers" />}>
                <Route path="/cadastros/embarcadores" element={<Shippers />} />
              </Route>

              <Route element={<AdministratorRoute />}>
                <Route element={<PermissionRoute permission="admin.security" />}>
                  <Route path="/admin/seguranca" element={<Security />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
