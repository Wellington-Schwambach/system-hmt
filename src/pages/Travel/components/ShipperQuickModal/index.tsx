import { useState } from 'react';
import { X } from 'lucide-react';

import type { ShipperQuickModalProps } from './types';
import {
  Actions,
  CancelButton,
  CloseButton,
  Form,
  Header,
  Hint,
  Input,
  Label,
  Modal,
  Overlay,
  SaveButton,
  Subtitle,
  Title,
} from './styles';

export function ShipperQuickModal({
  isOpen,
  saving,
  onClose,
  onCreate,
  onCreated,
}: ShipperQuickModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  function handleClose() {
    if (saving) return;
    setName('');
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) return;

    const shipper = await onCreate(cleanName);
    if (!shipper) return;

    onCreated(shipper);
    setName('');
    onClose();
  }

  return (
    <Overlay
      role="presentation"
      onMouseDown={(event) => {
        event.stopPropagation();
        if (!saving) handleClose();
      }}
    >
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipper-quick-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="shipper-quick-modal-title">Novo embarcador</Title>
            <Subtitle>
              O embarcador será gravado no banco e selecionado automaticamente na viagem.
            </Subtitle>
          </div>
          <CloseButton type="button" onClick={handleClose} disabled={saving} aria-label="Fechar">
            <X size={18} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Label htmlFor="new-shipper-name">
            Nome do embarcador
            <Input
              id="new-shipper-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: BRF"
              maxLength={100}
              autoFocus
              required
            />
          </Label>
          <Hint>Cadastros duplicados, inclusive com diferença de maiúsculas e minúsculas, são bloqueados.</Hint>

          <Actions>
            <CancelButton type="button" onClick={handleClose} disabled={saving}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={saving || name.trim().length < 2}>
              {saving ? 'Salvando...' : 'Cadastrar e selecionar'}
            </SaveButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}
