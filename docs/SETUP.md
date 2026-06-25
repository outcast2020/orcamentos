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
- pasta de lixeira: criada automaticamente com o nome `Lixeira Cordel 2.0 - Orçamentos`;
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
`FOLDER_ID`, `DRAFT_FOLDER_ID`, `EXECUTION_FOLDER_ID` e `TRASH_FOLDER_ID`,
caso o destino mude. Se `TRASH_FOLDER_ID` estiver vazio, `setupPlanilha`
localiza ou cria a pasta automaticamente e grava seu ID.

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
- pasta de lixeira configurada;
- senha configurada;
- aba encontrada;
- gatilho de execução ativo;
- próximo fólio disponível.

O `setupPlanilha` também normaliza fólios antigos que tenham perdido os zeros
à esquerda e repara registros que já possuam arquivo na pasta de execução.

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
para notificar coordenação e produção quando o orçamento é finalizado como
Enviado e quando entra em Execução. Essas notificações não levam anexos.

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
3. salvar como rascunho e tentar clicar novamente durante a gravação;
4. conferir que existe apenas o JSON na pasta de rascunhos, sem PDF e sem fólio definitivo;
5. abrir a aba Rascunhos e retomar;
6. informar o e-mail do cliente e marcar a confirmação de envio;
7. finalizar como enviado, baixar o PDF e confirmar que abre corretamente;
8. executar `diagnosticarUltimoPdf` e anotar o `pdfFileId` exibido;
9. abrir a aba Enviados e usar **Enviar para execução**;
10. confirmar que o cartão aparece em Aceitos / execução como **Em execução**;
11. conferir que o mesmo arquivo foi movido para a pasta de execução e executar
    novamente `diagnosticarUltimoPdf`; `mesmoIdDuranteFluxo` deve ser `true`;
12. confirmar que as duas notificações internas chegaram sem anexo;
13. informar pagamento, data e andamento em Aceitos / execução;
14. cancelar digitando exatamente o fólio, conferir a aba Lixeira e restaurar;
15. repetir a finalização simultaneamente em dois navegadores e executar
    `diagnosticarConcorrenciaEIdempotencia`; as listas de duplicados devem estar vazias;
16. conferir a linha correspondente na planilha;
17. abrir a engrenagem de Configurações, alterar o ISS e testar a inclusão e
    remoção de um CNAE.

Depois da primeira atualização, execute uma vez a função `limparDuplicados`
no editor do Apps Script. Ela mantém o registro mais recente de cada fólio e
move arquivos repetidos com o mesmo nome para a lixeira.

Se a planilha tiver muitas linhas ou colunas vazias, execute uma vez
`otimizarGradePlanilha`. A função preserva todos os dados e mantém uma pequena
reserva de linhas, removendo apenas o excesso vazio da grade física.

Após instalar esta versão sobre uma implantação anterior, execute também
`repararStatusExecucaoAnteriores`. A função transforma fólios numéricos como
`10` em `00010` e marca como aceitos os registros que já tenham arquivo na
pasta de execução.

### Validação local desta versão — 25/06/2026

- sintaxe de `app.js` e `Code.gs`: aprovada;
- IDs usados pelo JavaScript e elementos do HTML: aprovados, sem ausências ou duplicações;
- rascunho incompleto no navegador: salvo sem PDF e com o botão de PDF bloqueado;
- aba Lixeira e ações coerentes de Enviados / Aceitos: renderizadas;
- idempotência simulada: a repetição do mesmo `operationId` retornou o resultado anterior;
- histórico de `operationId`: preservado entre gravações;
- URL de PDF: gerada no formato de download direto do Drive;
- sanitização Base64, validação obrigatória e preservação do `pdfFileId`: aprovadas nos testes locais.

Drive, Sheets e MailApp só podem ser validados integralmente depois de colar o
novo `Code.gs` e publicar uma nova versão do Web App. Complete os passos 7 a
15 acima antes de considerar a implantação aprovada para uso real.

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
- Rascunhos nunca geram PDF; somente o JSON é atualizado.
- O PDF definitivo é criado uma única vez na pasta Enviados e depois movido
  para Execução sem mudar de ID.
- O arquivo JSON do rascunho é atualizado no mesmo arquivo sempre que houver novo salvamento.
- O fólio é protegido por bloqueio e cada gravação tem um identificador idempotente.
- Leituras e atualizações coletivas usam arrays e uma única operação de
  planilha sempre que possível.
- A listagem usa cache de 5 minutos no Apps Script, invalidado imediatamente
  após qualquer gravação.
- O navegador mostra o último histórico da sessão enquanto revalida os dados
  em segundo plano.
- O `setupPlanilha` cria um gatilho diário para verificar follow-ups vencidos.
- A passagem nova para execução é concluída na própria ação e preserva o
  `pdfFileId`; o gatilho de execução permanece apenas para recuperar registros
  antigos que tenham ficado pendentes.
- Se um registro antigo permanecer com erro, corrija a configuração e execute
  `reenfileirarExecucoesComErro` uma vez no editor.
- `Code.gs` está no `.gitignore`; atualize-o diretamente no Google Apps Script.
- Integrações futuras permanecem invisíveis na interface e desativadas no
  backend até configuração e implementação expressas.
