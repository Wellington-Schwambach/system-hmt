# Select pesquisável e sidebar por hover

Esta atualização não altera o banco de dados e não exige migration.

## Estado e Cidade

Os selects de Estado e Cidade no cadastro de colaboradores foram substituídos por um combobox pesquisável próprio.

Recursos:
- busca instantânea por texto;
- Estado pode ser encontrado pelo nome ou UF;
- busca ignora acentos e diferenças entre maiúsculas/minúsculas;
- navegação por teclado com setas, Home, End, Enter e Esc;
- botão para limpar a seleção;
- Cidade continua vinculada ao Estado escolhido;
- contador de resultados e mensagem quando não houver correspondência.

## Sidebar

Em desktop, o sidebar permanece recolhido e expande automaticamente ao passar o mouse ou ao navegar por teclado dentro dele. Ao retirar o mouse, volta ao modo recolhido.

A área principal permanece fixa durante a expansão, evitando deslocamento do conteúdo.

Em telas menores, o comportamento mobile pelo botão do menu foi mantido.

## Aplicação

Não há SQL novo.

```bash
npm install
npm run dev
```
