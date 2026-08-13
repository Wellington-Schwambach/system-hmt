import { Eye, EyeOff, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

import { useNotifications } from '../../contexts/Notifications';
import { authService } from '../../services/authService';
import { getApiErrorFeedback } from '../../utils/apiError';
import {
  Backdrop,
  Body,
  CloseButton,
  Description,
  Field,
  Footer,
  Header,
  HeaderCopy,
  Hint,
  Input,
  Modal,
  PasswordField,
  PrimaryButton,
  SecondaryButton,
  Title,
  VisibilityButton,
} from './styles';
import type { ChangePasswordModalProps } from './types';

interface PasswordFormState {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

const INITIAL_FORM: PasswordFormState = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const notifications = useNotifications();
  const titleId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PasswordFormState>(INITIAL_FORM);
  const [visibleField, setVisibleField] = useState<keyof PasswordFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = useCallback(() => {
    if (isSaving) {
      return;
    }

    setForm(INITIAL_FORM);
    setVisibleField(null);
    onClose();
  }, [isSaving, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => firstInputRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  function setField(field: keyof PasswordFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleVisibility(field: keyof PasswordFormState) {
    setVisibleField((current) => (current === field ? null : field));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password !== form.passwordConfirmation) {
      notifications.warning('Confirmação diferente', 'A confirmação da nova senha não confere.');
      return;
    }

    setIsSaving(true);

    try {
      const message = await authService.updatePassword({
        current_password: form.currentPassword,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });

      setForm(INITIAL_FORM);
      setVisibleField(null);
      notifications.success('Senha alterada', message);
      onClose();
    } catch (submitError) {
      const feedback = getApiErrorFeedback(submitError, 'Não foi possível alterar a senha.');
      notifications.error(feedback.title, feedback.message, feedback.details);
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <Backdrop
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Header>
          <HeaderCopy>
            <Title id={titleId}>Alterar senha</Title>
            <Description>
              Confirme sua senha atual e defina uma nova senha para sua conta.
            </Description>
          </HeaderCopy>

          <CloseButton
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Fechar alteração de senha"
          >
            <X size={19} aria-hidden="true" />
          </CloseButton>
        </Header>

        <Body>
          <Field>
            Senha atual
            <PasswordField>
              <Input
                ref={firstInputRef}
                type={visibleField === 'currentPassword' ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(event) => setField('currentPassword', event.target.value)}
                autoComplete="current-password"
                required
                disabled={isSaving}
              />
              <VisibilityButton
                type="button"
                onClick={() => toggleVisibility('currentPassword')}
                aria-label="Mostrar ou ocultar senha atual"
                disabled={isSaving}
              >
                {visibleField === 'currentPassword' ? <EyeOff size={18} /> : <Eye size={18} />}
              </VisibilityButton>
            </PasswordField>
          </Field>

          <Field>
            Nova senha
            <PasswordField>
              <Input
                type={visibleField === 'password' ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setField('password', event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSaving}
              />
              <VisibilityButton
                type="button"
                onClick={() => toggleVisibility('password')}
                aria-label="Mostrar ou ocultar nova senha"
                disabled={isSaving}
              >
                {visibleField === 'password' ? <EyeOff size={18} /> : <Eye size={18} />}
              </VisibilityButton>
            </PasswordField>
            <Hint>Use pelo menos 8 caracteres, com maiúscula, minúscula e número.</Hint>
          </Field>

          <Field>
            Confirmar nova senha
            <PasswordField>
              <Input
                type={visibleField === 'passwordConfirmation' ? 'text' : 'password'}
                value={form.passwordConfirmation}
                onChange={(event) => setField('passwordConfirmation', event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSaving}
              />
              <VisibilityButton
                type="button"
                onClick={() => toggleVisibility('passwordConfirmation')}
                aria-label="Mostrar ou ocultar confirmação da nova senha"
                disabled={isSaving}
              >
                {visibleField === 'passwordConfirmation' ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </VisibilityButton>
            </PasswordField>
          </Field>
        </Body>

        <Footer>
          <SecondaryButton type="button" onClick={handleClose} disabled={isSaving}>
            Fechar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSaving}>
            {isSaving ? 'Alterando...' : 'Alterar senha'}
          </PrimaryButton>
        </Footer>
      </Modal>
    </Backdrop>,
    document.body,
  );
}
