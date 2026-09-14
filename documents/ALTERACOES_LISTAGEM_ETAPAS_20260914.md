# Ajustes da Logística — 14/09/2026

## Listagem diária
- Embarcador exibido com a cor cadastrada, incluindo contraste automático do texto.
- Colunas redimensionadas para ocupar a largura disponível sem largura fixa gigante.
- Em telas menores, a listagem muda para cards responsivos.
- Coluna Ações compactada e botão Excluir adicionado ao lado de Editar/Duplicar.
- Coluna Etapa movida para depois de Status viagem.
- Locais de coleta e baixa voltaram a ser exibidos na ordem correta.
- Removidos o título "Listagem do dia" e o texto explicativo abaixo dele.

## Regra da etapa por data
A etapa mostrada na listagem agora é determinada pela data selecionada:
- data de coleta/agendamento de coleta -> Coleta;
- data de carregamento -> Carregando;
- data de baixa/agendamento de baixa -> Baixa;
- caso não haja evento no dia, utiliza o último evento operacional anterior; antes de qualquer evento, Programação.

Quando dois eventos coincidirem no mesmo dia, a prioridade visual é Baixa > Carregamento > Coleta.

## Baixas na listagem
- A listagem passa a considerar `delivery_at` e os registros de `delivery_appointments`.
- O backend passou a buscar também baixas agendadas dentro do intervalo mensal.
- Baixas continuam sem criar um novo bloco no calendário principal; aparecem ao entrar na respectiva data.

## Calendário e tipografia
- Domingo reduzido para uma faixa compacta com DOM + número do dia.
- Segunda a sábado aproveitam o espaço liberado.
- Tipografia do calendário e listagem ampliada e responsiva.
- Escala tipográfica global levemente responsiva para melhorar a leitura do sistema em telas maiores.

## Validação
- `npm run build`: aprovado (TypeScript + Vite).
- ESLint dos arquivos alterados: aprovado.
- `php -l` em 127 arquivos de app/rotas/migrations: aprovado.
- O lint completo do repositório ainda aponta 3 ocorrências preexistentes fora destes ajustes: `src/navigation/constants.ts`, `src/pages/BI/hooks.ts` e `src/pages/Travel/components/TravelFormModal/index.tsx`.
