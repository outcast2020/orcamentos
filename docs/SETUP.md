# Configuração e publicação

## 1. Preparar o Google Apps Script

1. Crie um projeto em [script.google.com](https://script.google.com).
2. Substitua o conteúdo do editor pelo arquivo `Code.gs` deste projeto.
3. Salve o projeto.
4. Execute manualmente a função `setupPlanilha`.
5. Autorize o acesso solicitado à Planilha, Drive, envio de notificações e gatilhos.

O setup usa inicialmente:

- planilha: `1cQHG_boOZcptbIVsF-TEElBGJeTSzQ3Zyl934NF9L8s`;
- pasta de PDFs no Drive: `1dP_N7KUNf96EEGe3TYd_6npisjGm3jac`;
- pasta de rascunhos JSON: `1c9iyM1PJPAlzLL3sFqsjAIwXrdCUgesc`;
- pasta de aceitos / execução: `1SsCPoXW1TWtKS8ZQKH8uvnKHO11j5b_m`;
- aba: `Orçamentos`;
- primeiro fólio: `00010`.

Se a planilha estiver vazia, o cabeçalho e a formatação serão criados. Se já houver registros, colunas ausentes serão acrescentadas sem apagar as existentes.

## 2. Cadastrar a senha com segurança

No projeto do Apps Script:

1. Abra **Configurações do projeto**.
2. Em **Propriedades do script**, clique em **Adicionar propriedade**.
3. Use o nome `APP_PASSWORD`.
4. Informe a senha combinada pela equipe.
5. Salve.

Não coloque essa senha em nenhum arquivo do frontend: o conteúdo de um GitHub Pages é público.

No login, a senha é enviada uma única vez por HTTPS ao Apps Script e trocada
por uma sessão temporária. O navegador não guarda nem repete a senha nas
operações seguintes.

Os IDs também podem ser substituídos pelas propriedades `SHEET_ID`,
`FOLDER_ID`, `DRAFT_FOLDER_ID` e `EXECUTION_FOLDER_ID`, caso o destino mude.

O `setupPlanilha` também cria:

- `APP_SETTINGS`, para ISS padrão e CNAEs editáveis;
- `INTEGRATIONS_CONFIG`, inicialmente desativada.

Credenciais fiscais, bancárias ou da Cora nunca devem ser colocadas no
frontend, GitHub ou planilha. Quando uma integração for implementada, seus
segredos deverão ficar apenas nas Propriedades do script.

## 3. Conferir o backend

Execute a função `diagnosticarConfiguracao`.

O registro de execução deve indicar:

- planilha configurada;
- pasta configurada;
- pasta de rascunhos configurada;
- pasta de execução configurada;
- senha configurada;
- aba encontrada;
- gatilho de execução ativo;
- próximo fólio disponível.

## 4. Implantar como Web App

1. Clique em **Implantar > Nova implantação**.
2. Selecione **Aplicativo da Web**.
3. Executar como: **você**.
4. Quem pode acessar: **qualquer pessoa**.
5. Clique em **Implantar**.
6. Copie a URL terminada em `/exec`.

A API pode ficar publicamente acessível porque as operações de leitura e gravação exigem a senha do backend. O endpoint `GET` retorna somente um diagnóstico básico, sem dados dos orçamentos.

Mais precisamente, após o login as operações exigem um token temporário de
sessão. Conhecer a URL `/exec` não concede acesso aos registros.

Sempre que alterar `Code.gs`, edite a implantação existente e selecione uma
**nova versão**. A URL `/exec` pode continuar a mesma.

O envio direto de orçamento ao cliente está temporariamente indisponível. O
Apps Script usa e-mail somente para os alertas internos de acompanhamento e
para notificar coordenação e produção quando um orçamento entra em execução.

## 5. Conectar o frontend

Abra `config.js` e substitua:

```js
GAS_URL: 'COLE_AQUI_A_URL_DO_APPS_SCRIPT'
```

pela URL `/exec` da implantação.

Não é necessário colocar senha em `config.js`.

## 6. Testar antes do GitHub

Faça este percurso:

1. entrar com a senha;
2. criar um orçamento com dois itens;
3. baixar o PDF e a imagem e conferir se ambos estão completos;
4. salvar como rascunho e tentar clicar novamente durante a gravação;
5. conferir o arquivo `Rascunho_00010_Cliente.json` na pasta de rascunhos;
6. abrir a aba Rascunhos e retomar;
7. informar o e-mail do cliente e marcar a confirmação de envio;
8. salvar como enviado e conferir o PDF na pasta do Drive;
9. abrir a aba Enviados e usar **Enviar para execução**;
10. confirmar que o cartão muda imediatamente para **Execução na fila**;
11. aguardar até um minuto e confirmar a mudança para **Em execução**;
12. conferir o arquivo na pasta de execução e as notificações enviadas para
    coordenação e produção;
13. informar pagamento e data em Aceitos / execução;
14. conferir a linha correspondente na planilha;
15. abrir a engrenagem de Configurações, alterar o ISS e testar a inclusão e
    remoção de um CNAE.

Depois da primeira atualização, execute uma vez a função `limparDuplicados`
no editor do Apps Script. Ela mantém o registro mais recente de cada fólio e
move arquivos repetidos com o mesmo nome para a lixeira.

Se a planilha tiver muitas linhas ou colunas vazias, execute uma vez
`otimizarGradePlanilha`. A função preserva todos os dados e mantém uma pequena
reserva de linhas, removendo apenas o excesso vazio da grade física.

## 7. Publicar no GitHub Pages

1. Crie o repositório.
2. Envie os arquivos mantendo a estrutura atual.
3. Em **Settings > Pages**, publique a branch principal pela pasta raiz.
4. Aguarde a URL do GitHub Pages ficar disponível.
5. Repita o teste completo já no endereço online.

Para domínio próprio, adicione o domínio nas configurações do GitHub Pages somente depois de configurar o DNS.

## Cuidados de operação

- Não renomeie os cabeçalhos da aba `Orçamentos`.
- Não publique a senha em commits, capturas de tela ou documentação.
- Ao mudar o percentual de ISS no formulário, o valor fica registrado em cada orçamento.
- Ao salvar novamente, a cópia anterior do PDF é substituída para evitar duplicados.
- O arquivo JSON do rascunho é atualizado no mesmo arquivo sempre que houver novo salvamento.
- O fólio é protegido por bloqueio e cada gravação tem um identificador idempotente.
- Leituras e atualizações coletivas usam arrays e uma única operação de
  planilha sempre que possível.
- A listagem usa cache de 5 minutos no Apps Script, invalidado imediatamente
  após qualquer gravação.
- O navegador mostra o último histórico da sessão enquanto revalida os dados
  em segundo plano.
- O `setupPlanilha` cria um gatilho diário para verificar follow-ups vencidos.
- O `setupPlanilha` cria também um gatilho a cada minuto para processar a fila
  de aceitos sem travar o clique do usuário.
- Se uma execução falhar três vezes, corrija a configuração e execute
  `reenfileirarExecucoesComErro` uma vez no editor.
- `Code.gs` está no `.gitignore`; atualize-o diretamente no Google Apps Script.
- Integrações futuras permanecem invisíveis na interface e desativadas no
  backend até configuração e implementação expressas.
