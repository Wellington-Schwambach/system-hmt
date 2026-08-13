import { CheckCircle2, ClipboardList, Clock3, Truck } from 'lucide-react';

import {
  Card,
  CardHeader,
  HeaderIcon,
  HeaderTitle,
  NoteItem,
  NoteIcon,
  NoteText,
  NoteTime,
  NotesList,
} from './styles';

const NOTES = [
  {
    id: 'dispatch',
    icon: Truck,
    text: 'Conferir saída da frota da rota Sul.',
    time: '14/07/2026 - 08:30',
  },
  {
    id: 'fuel',
    icon: ClipboardList,
    text: 'Revisar fechamento de combustível.',
    time: '14/07/2026 - 11:00',
  },
  {
    id: 'documents',
    icon: CheckCircle2,
    text: 'Documentação do veículo HT-204 validada.',
    time: '14/07/2026 - 14:20',
  },
];

export function NotesCard() {
  return (
    <Card>
      <CardHeader>
        <HeaderIcon>
          <Clock3 size={20} aria-hidden="true" />
        </HeaderIcon>
        <HeaderTitle>Notas do dia</HeaderTitle>
      </CardHeader>

      <NotesList>
        {NOTES.map((note) => {
          const Icon = note.icon;

          return (
            <NoteItem key={note.id}>
              <NoteIcon>
                <Icon size={19} aria-hidden="true" />
              </NoteIcon>
              <NoteText>{note.text}</NoteText>
              <NoteTime>{note.time}</NoteTime>
            </NoteItem>
          );
        })}
      </NotesList>
    </Card>
  );
}
