# Barra horizontal fixa da listagem — 14/09/2026

- A barra horizontal auxiliar da listagem agora é renderizada diretamente no `document.body` via portal.
- Isso garante que `position: fixed` use o viewport da página, sem ficar limitado ou recortado pelo contêiner da listagem.
- Enquanto a listagem estiver visível e houver overflow horizontal, a barra permanece fixa no rodapé da tela durante a rolagem vertical normal da página.
- A barra continua sincronizada nos dois sentidos com a rolagem horizontal real da tabela.
- Não foi adicionada rolagem vertical interna: a única rolagem vertical continua sendo a da página/navegador.
