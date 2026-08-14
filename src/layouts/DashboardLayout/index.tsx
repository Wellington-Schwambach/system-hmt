import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import { DashboardHeader } from '../../components/DashboardHeader';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/Auth/useAuth';
import { useNotifications } from '../../contexts/Notifications';
import { useDashboardSidebar } from './hooks';
import { Content, HeaderSlot, Layout, Main, SidebarSlot } from './styles';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notifications = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const {
    isSidebarOpen,
    isSidebarCollapsed,
    openSidebar,
    closeSidebar,
    expandSidebar,
    collapseSidebar,
  } = useDashboardSidebar();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      notifications.success('Sessão encerrada', 'Você saiu do sistema com segurança.');
    } catch (error) {
      console.error('Não foi possível encerrar a sessão no servidor.', error);
      notifications.warning(
        'Sessão encerrada localmente',
        'O servidor não respondeu, mas os dados da sessão foram removidos deste navegador.',
      );
    } finally {
      navigate('/login', { replace: true });
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, navigate, notifications]);

  const handleChangePassword = useCallback(() => {
    setIsPasswordModalOpen(true);
  }, []);

  const handleEditProfile = useCallback(() => {
    notifications.info('Recurso em preparação', 'A atualização cadastral estará disponível em breve.');
  }, [notifications]);

  const handleOpenPreferences = useCallback(() => {
    notifications.info('Recurso em preparação', 'As preferências do sistema estarão disponíveis em breve.');
  }, [notifications]);

  return (
    <Layout $isSidebarCollapsed={isSidebarCollapsed}>
      <SidebarSlot>
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeSidebar}
          onExpand={expandSidebar}
          onCollapse={collapseSidebar}
        />
      </SidebarSlot>

      <Main>
        <HeaderSlot>
          <DashboardHeader
            onMenuOpen={openSidebar}
            onLogout={() => void handleLogout()}
            onChangePassword={handleChangePassword}
            onEditProfile={handleEditProfile}
            onOpenPreferences={handleOpenPreferences}
            user={{
              name: user?.name ?? 'Usuário',
              role: user?.role ?? 'Usuário do sistema',
            }}
          />
        </HeaderSlot>

        <Content>
          <Outlet />
        </Content>
      </Main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Layout>
  );
}
