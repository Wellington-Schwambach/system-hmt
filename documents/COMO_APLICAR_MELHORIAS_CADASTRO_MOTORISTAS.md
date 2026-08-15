# Melhorias no cadastro de motoristas

## O que foi alterado

### Máscaras de CPF e telefone

Os campos continuam aceitando somente números durante a digitação. Ao sair do campo com `Tab` ou clicar em outro campo, o sistema apresenta:

- CPF: `000.000.000-00`
- Telefone com 11 dígitos: `(00) 00000-0000`
- Telefone com 10 dígitos: `(00) 0000-0000`

No PostgreSQL, CPF e telefone continuam gravados somente com números.

### Listagem

- Removido o texto `Motorista · Ativo` abaixo do nome.
- Criada uma coluna exclusiva de Status.
- Ativo aparece em verde.
- Afastado aparece em amarelo.
- Inativo aparece em vermelho.
- Nome e CPF receberam mais espaço para evitar cortes.
- A listagem é ordenada alfabeticamente pelo nome no backend e no frontend.

### Endereço estruturado

O campo único de endereço foi substituído por:

- Rua
- Número
- Bairro
- Estado
- Cidade

A cidade é carregada conforme o estado selecionado.

Os endereços antigos não são apagados. Durante a migration, o endereço completo anterior é copiado para o campo Rua, para permitir revisão posterior.

### Estados e cidades

Foram criadas as tabelas:

- `brazil_states`
- `brazil_cities`

A carga contém 27 unidades federativas e 5.571 localidades municipais/equivalentes, identificadas pelo código IBGE.

Os arquivos utilizados pela migration ficam em:

- `backend/database/data/brazil_states.csv`
- `backend/database/data/brazil_cities.csv`

## Aplicação recomendada

Na pasta do backend:

```bash
cd backend
php artisan optimize:clear
php artisan migrate
```

Depois, na raiz do projeto:

```bash
npm install
npm run dev
```

## SQL manual

Caso não vá utilizar as migrations, execute:

```text
sql/AJUSTE_BANCO_ENDERECO_MOTORISTAS_ESTADOS_CIDADES.sql
```

Não execute o SQL manual e a migration para a mesma atualização.

## APIs criadas

```text
GET /api/locations/states
GET /api/locations/states/{state}/cities
```

As duas rotas exigem autenticação, horário de acesso válido e permissão de cadastro de colaboradores.

## Novas colunas em employees

```text
address_street
address_number
address_neighborhood
state_id
city_id
```

O campo `full_address` foi mantido para compatibilidade com módulos antigos e passa a ser montado automaticamente pelo backend.

## Exportação Excel

O Excel filtrado agora exporta o endereço em colunas separadas:

- Rua
- Número
- Bairro
- Cidade
- Estado
- UF
