# Ajustes da Logística - 08/09/2026

- Calendário aparece aberto diretamente ao entrar na tela.
- Removidos os botões superiores Agendamento, Coleta, Carregamento e Baixa/Entrega.
- O calendário mantém Agendamento e Carregamentos separados dentro de cada dia.
- Ao clicar em uma data, o calendário é substituído por uma listagem única do dia.
- Listagem com: Embarcador, Grade, Hora da Grade, Origem, Plano, Nº Carga, Armador, Navio, Deadline, Booking, Baixa, Observação e ações Editar/Duplicar.
- Cada linha possui barra lateral com a cor do embarcador.
- Clique na linha abre painel lateral somente leitura com todos os dados operacionais cadastrados.
- Cadastro ganhou os campos Grade e Data/Hora da Grade.
- Banco ganhou `grade_number` e `grade_at`.

## Banco

Execute uma das opções:

```bash
php artisan migrate
```

ou aplique manualmente:

`sql/AJUSTE_BANCO_LOGISTICA_GRADE_20260908.sql`
