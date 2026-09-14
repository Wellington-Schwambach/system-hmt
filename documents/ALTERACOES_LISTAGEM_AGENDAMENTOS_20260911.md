# Ajustes da listagem diária e agendamentos - 11/09/2026

## Listagem do dia
- Colunas reorganizadas para: Embarcador, Grade, Hora, Origem, Destino, Armador, Local de coleta, Agendada? (coleta), Local de baixa, Agendada? (baixa), Observação e Ações.
- Grade e Hora continuam usando a data/hora do carregamento.
- Origem e Destino usam as cidades operacionais, separadas dos locais específicos de coleta/baixa.
- Local de baixa passou a ser texto livre e pode ser alterado diretamente na listagem.
- Indicador de agendamento: verde quando existe agendamento e vermelho quando não existe.

## Agendamentos múltiplos
- Clique no indicador de coleta ou baixa abre uma janela própria.
- A janela permite adicionar vários horários, cada um com Data/Hora e Tipo do Local.
- Agendamentos de coleta alimentam também o calendário principal.
- Registros antigos com data de agendamento da coleta são migrados para a nova estrutura.

## Calendário / novo cadastro
- Ao abrir Nova carga estando dentro de uma data selecionada, a Data do Carregamento é preenchida com o dia clicado e fica fixa; a hora continua editável.
- Ao abrir Nova carga sem selecionar um dia, a Data/Hora do Carregamento permanece vazia.
- Domingo recebeu largura menor no calendário mensal.
- A barra com a data selecionada permanece fixa durante a rolagem da listagem.

## Banco
- Nova migration: `2026_09_11_210000_add_logistics_appointment_lists.php`.
- SQL manual equivalente: `sql/AJUSTE_BANCO_AGENDAMENTOS_MULTIPLOS_LOGISTICA_20260911.sql`.
- Novas colunas JSONB: `collection_appointments` e `delivery_appointments`.
