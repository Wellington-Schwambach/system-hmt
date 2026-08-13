import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { FormField } from '../../../../components/FormField';
import { Icon } from '../../../../components/Icon';
import { useAuth } from '../../../../contexts/Auth/useAuth';
import { useNotifications } from '../../../../contexts/Notifications';
import { canAccessPath, getFirstAccessiblePath } from '../../../../navigation/access';
import { getApiErrorFeedback } from '../../../../utils/apiError';
import {
  ForgotPasswordButton,
  Form,
  FormUtilities,
  IconButton,
  LoadingIcon,
} from './styles';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authNotice, login } = useAuth();
  const notifications = useNotifications();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((currentValue) => !currentValue);
  }, []);

  useEffect(() => {
    if (authNotice) {
      notifications.warning('Sessão encerrada', authNotice);
    }
  }, [authNotice, notifications]);

  const handleForgotPassword = useCallback(() => {
    notifications.info(
      'Redefinição de senha',
      'Entre em contato com o administrador do sistema para redefinir sua senha.',
    );
  }, [notifications]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        const authenticatedUser = await login({
          username: username.trim().toLowerCase(),
          password,
          remember,
        });

        notifications.success('Login realizado', `Bem-vindo, ${authenticatedUser.name}.`);

        const state = location.state as LoginLocationState | null;
        const requestedPath = state?.from?.pathname;
        const destination =
          requestedPath && requestedPath !== '/login'
            ? requestedPath
            : getFirstAccessiblePath(authenticatedUser);

        const canOpenRequestedPath = !requestedPath || canAccessPath(authenticatedUser, requestedPath);

        navigate(canOpenRequestedPath ? destination : getFirstAccessiblePath(authenticatedUser), {
          replace: true,
        });
      } catch (error) {
        const feedback = getApiErrorFeedback(error, 'Não foi possível realizar o login.');
        notifications.error(feedback.title, feedback.message, feedback.details);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, location.state, login, navigate, notifications, password, remember, username],
  );

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <FormField
        id="username"
        label="Usuário"
        name="username"
        type="text"
        placeholder="Digite seu usuário"
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        disabled={isSubmitting}
        required
        leadingIcon={<Icon icon={UserRound} size={21} />}
      />

      <FormField
        id="password"
        label="Senha"
        name="password"
        type={isPasswordVisible ? 'text' : 'password'}
        placeholder="Digite sua senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isSubmitting}
        required
        leadingIcon={<Icon icon={LockKeyhole} size={21} />}
        trailingAction={
          <IconButton
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            disabled={isSubmitting}
          >
            <Icon icon={isPasswordVisible ? EyeOff : Eye} size={21} />
          </IconButton>
        }
      />

      <FormUtilities>
        <Checkbox
          label="Lembrar de mim"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          disabled={isSubmitting}
        />
        <ForgotPasswordButton type="button" onClick={handleForgotPassword}>
          Esqueci minha senha
        </ForgotPasswordButton>
      </FormUtilities>

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting || !username.trim() || !password}
        leadingIcon={
          isSubmitting ? (
            <LoadingIcon>
              <Icon icon={LoaderCircle} size={21} />
            </LoadingIcon>
          ) : (
            <Icon icon={LogIn} size={21} />
          )
        }
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </Form>
  );
}
