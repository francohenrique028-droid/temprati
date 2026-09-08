# Atualização visual do painel administrativo

## Objetivo
Transformar o `/admin` existente em um painel com navegação azul-marinho fixa e área de trabalho clara, sem alterar autenticação, Supabase ou a loja pública.

## Implementação
- Reestilizar o menu lateral existente com a marca “PAINEL ADMIN / MISTTORE”, grupos e itens solicitados, destaque coral para a rota ativa e rodapé com acesso à loja e logout.
- Manter os links já implementados totalmente funcionais. Itens sem tela administrativa existente serão exibidos de forma não clicável para evitar rotas quebradas.
- Preservar o menu recolhível atual no celular e ajustar a estrutura para largura aproximada de 220 px no desktop.
- Substituir o redirecionamento de `/admin/dashboard` por um dashboard real com título, subtítulo, atualização manual e cinco cards em linha no desktop e empilhados no celular.
- Consultar a tabela `products` para total de produtos e estoque baixo; métricas sem tabela disponível (pedidos, clientes e logística) mostrarão `0`, sem dados fictícios.
- Manter `/admin` direcionando ao dashboard e preservar integralmente as telas de produtos e login.

## Validação
- Verificar tipagem e o build automático após as alterações.
- Conferir visualmente o painel em desktop e celular, incluindo abertura e fechamento do menu móvel.
