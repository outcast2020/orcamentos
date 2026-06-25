const CONFIG = window.CORDEL_CONFIG || {};
const GAS_URL = String(CONFIG.GAS_URL || '').trim();
const OFFICIAL_SITE = CONFIG.OFFICIAL_SITE || 'https://www.cordel2pontozero.com';
const CONTACT_EMAIL = 'contato@cordel2pontozero.com';

const DEFAULT_CNAES = [
  {
    grupo: 'Atividade principal',
    codigo: '62.04-0-00',
    descricao: 'Consultoria em tecnologia da informação'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '62.01-5-02',
    descricao: 'Web design'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '62.01-5-01',
    descricao: 'Desenvolvimento de programas de computador sob encomenda'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '62.02-3-00',
    descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '82.30-0-01',
    descricao: 'Serviços de organização de feiras, congressos, exposições e festas'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '85.50-3-02',
    descricao: 'Atividades de apoio à educação, exceto caixas escolares'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '32.40-0-01',
    descricao: 'Fabricação de jogos eletrônicos'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '85.99-6-04',
    descricao: 'Treinamento em desenvolvimento profissional e gerencial'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '72.20-7-00',
    descricao: 'Pesquisa e desenvolvimento experimental em ciências sociais e humanas'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '63.99-2-00',
    descricao: 'Outras atividades de prestação de serviços de informação não especificadas anteriormente'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '85.99-6-03',
    descricao: 'Treinamento em informática'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '85.92-9-99',
    descricao: 'Ensino de arte e cultura não especificado anteriormente'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '58.19-1-00',
    descricao: 'Edição de cadastros, listas e de outros produtos gráficos'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '58.13-1-00',
    descricao: 'Edição de revistas'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '58.11-5-00',
    descricao: 'Edição de livros'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '74.90-1-01',
    descricao: 'Serviços de tradução, interpretação e similares'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '74.90-1-99',
    descricao: 'Outras atividades profissionais, científicas e técnicas não especificadas anteriormente'
  },
  {
    grupo: 'Atividades secundárias',
    codigo: '85.99-6-99',
    descricao: 'Outras atividades de ensino não especificadas anteriormente'
  }
];

const OUTRO_CNAE = '__OUTRO__';
const LOCAL_RECORDS_KEY = 'cordelOrcamentosLocaisV2';
const LOCAL_SETTINGS_KEY = 'cordelConfiguracoesV1';
const SESSION_KEY = 'cordelSessionToken';
const RECORDS_CACHE_KEY = 'cordelRecordsCacheV1';

const state = {
  accessToken: '',
  localMode: false,
  folio: '',
  draftFileId: '',
  draftUrl: '',
  saving: false,
  saveOperationId: '',
  records: [],
  recordsLoadedAt: 0,
  recordsPromise: null,
  suggestions: [],
  items: [newItem()],
  settings: {
    issDefault: 5,
    cnaes: cloneCnaes(DEFAULT_CNAES)
  },
  settingsDraft: []
};

const elements = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheElements();
  populateCnaes();
  bindEvents();
  setToday();
  renderItemsEditor();
  updateCustomCnaeFields();
  updatePreview();

  elements.officialSiteLink.href = OFFICIAL_SITE;

  if (!isBackendConfigured()) {
    elements.localModeButton.hidden = false;
    setMessage(
      elements.loginMessage,
      'O backend ainda não foi configurado. Use o modo local para revisar o gerador.',
      ''
    );
    return;
  }

  const savedKey = sessionStorage.getItem(SESSION_KEY);
  if (savedKey) {
    state.accessToken = savedKey;
    resumeSession();
  }
}

function cacheElements() {
  [
    'loginScreen',
    'appShell',
    'loginForm',
    'senhaInput',
    'loginButton',
    'loginMessage',
    'localModeButton',
    'logoutButton',
    'officialSiteLink',
    'modeBadge',
    'settingsButton',
    'settingsDialog',
    'settingsForm',
    'closeSettingsButton',
    'cancelSettingsButton',
    'saveSettingsButton',
    'settingsIss',
    'settingsCnaeList',
    'addCnaeButton',
    'settingsMessage',
    'quoteForm',
    'editorTitle',
    'newQuoteButton',
    'autorOrcamento',
    'dataEmissao',
    'solicitadoPor',
    'emailCliente',
    'cnae',
    'customCnaeFields',
    'customCnaeCode',
    'customCnaeDescription',
    'descriptionSuggestionField',
    'descriptionSuggestion',
    'tituloServico',
    'descricaoServico',
    'itemsEditor',
    'addItemButton',
    'taxaISS',
    'editorSubtotal',
    'editorIss',
    'editorTotal',
    'dataRealizacao',
    'validadeDias',
    'localRealizacao',
    'condicaoPagamento',
    'naoInclusos',
    'enviadoEmail',
    'saveDraftButton',
    'saveSentButton',
    'statusMessage',
    'downloadImageButton',
    'downloadPdfButton',
    'quoteDocument',
    'docFolio',
    'docData',
    'docCnae',
    'docSolicitado',
    'docAutor',
    'docTituloServico',
    'docDescricao',
    'docItems',
    'docSubtotal',
    'docIssRate',
    'docIss',
    'docTotal',
    'docConditionsSection',
    'docConditions',
    'docNaoInclusos',
    'view-gerador',
    'view-records',
    'recordsTitle',
    'recordsFeedback',
    'recordsList'
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  elements.loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    authenticate(elements.senhaInput.value);
  });

  elements.localModeButton.addEventListener('click', () => {
    state.localMode = true;
    state.records = readLocalRecords();
    loadLocalSettings();
    enterApp();
  });

  elements.logoutButton.addEventListener('click', logout);
  elements.settingsButton.addEventListener('click', openSettings);
  elements.closeSettingsButton.addEventListener('click', closeSettings);
  elements.cancelSettingsButton.addEventListener('click', closeSettings);
  elements.addCnaeButton.addEventListener('click', addSettingsCnae);
  elements.settingsForm.addEventListener('submit', saveSettings);
  elements.settingsDialog.addEventListener('click', (event) => {
    if (event.target === elements.settingsDialog) closeSettings();
  });
  elements.newQuoteButton.addEventListener('click', () => resetQuote(true));
  elements.addItemButton.addEventListener('click', addItem);
  elements.saveDraftButton.addEventListener('click', () => saveQuote('Rascunho'));
  elements.saveSentButton.addEventListener('click', () => saveQuote('Enviado'));
  elements.downloadImageButton.addEventListener('click', downloadImage);
  elements.downloadPdfButton.addEventListener('click', downloadPdf);
  elements.cnae.addEventListener('change', () => {
    updateCustomCnaeFields();
    updateDescriptionSuggestions();
    updatePreview();
  });
  elements.descriptionSuggestion.addEventListener('change', applyDescriptionSuggestion);

  elements.quoteForm.addEventListener('input', updatePreview);
  elements.quoteForm.addEventListener('change', updatePreview);

  document.querySelectorAll('[data-view]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      showView(control.dataset.view);
    });
  });
}

function populateCnaes() {
  const currentValue = elements.cnae.value;
  elements.cnae.replaceChildren();

  const groups = new Map();
  state.settings.cnaes.forEach((item) => {
    if (!groups.has(item.grupo)) {
      const group = document.createElement('optgroup');
      group.label = item.grupo;
      groups.set(item.grupo, group);
      elements.cnae.appendChild(group);
    }

    const option = document.createElement('option');
    option.value = cnaeValue(item.codigo, item.descricao);
    option.textContent = option.value;
    groups.get(item.grupo).appendChild(option);
  });

  const otherGroup = document.createElement('optgroup');
  otherGroup.label = 'Outra atividade';
  const otherOption = document.createElement('option');
  otherOption.value = OUTRO_CNAE;
  otherOption.textContent = 'Outro CNAE — informar manualmente';
  otherGroup.appendChild(otherOption);
  elements.cnae.appendChild(otherGroup);

  if ([...elements.cnae.options].some((option) => option.value === currentValue)) {
    elements.cnae.value = currentValue;
  }
}

async function loadSettings() {
  if (state.localMode) {
    loadLocalSettings();
  } else {
    const settings = await callApi('carregarConfiguracao');
    applySettings(settings);
  }
}

function loadLocalSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || 'null');
    applySettings(saved);
  } catch {
    applySettings(null);
  }
}

function applySettings(settings) {
  const issDefault = Number(settings?.issDefault);
  const cnaes = Array.isArray(settings?.cnaes) ? normalizeCnaes(settings.cnaes) : [];

  state.settings = {
    issDefault: Number.isFinite(issDefault) && issDefault >= 0 && issDefault <= 100
      ? issDefault
      : 5,
    cnaes: cnaes.length ? cnaes : cloneCnaes(DEFAULT_CNAES)
  };

  populateCnaes();
  if (!state.folio) elements.taxaISS.value = String(state.settings.issDefault);
  updateCustomCnaeFields();
  updatePreview();
}

function openSettings() {
  state.settingsDraft = cloneCnaes(state.settings.cnaes);
  elements.settingsIss.value = String(state.settings.issDefault);
  renderSettingsCnaes();
  setMessage(elements.settingsMessage, '', '');
  elements.settingsDialog.showModal();
}

function closeSettings() {
  if (elements.settingsDialog.open) elements.settingsDialog.close();
}

function renderSettingsCnaes() {
  elements.settingsCnaeList.replaceChildren();

  state.settingsDraft.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'settings-cnae-row';

    const code = document.createElement('input');
    code.type = 'text';
    code.value = item.codigo;
    code.placeholder = '00.00-0-00';
    code.setAttribute('aria-label', `Código do CNAE ${index + 1}`);

    const description = document.createElement('input');
    description.type = 'text';
    description.value = item.descricao;
    description.placeholder = 'Descrição da atividade';
    description.setAttribute('aria-label', `Descrição do CNAE ${index + 1}`);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-item-button';
    remove.textContent = '×';
    remove.title = 'Remover CNAE';
    remove.setAttribute('aria-label', `Remover CNAE ${index + 1}`);

    code.addEventListener('input', () => {
      item.codigo = code.value;
    });
    description.addEventListener('input', () => {
      item.descricao = description.value;
    });
    remove.addEventListener('click', () => {
      state.settingsDraft.splice(index, 1);
      renderSettingsCnaes();
    });

    row.append(code, description, remove);
    elements.settingsCnaeList.appendChild(row);
  });
}

function addSettingsCnae() {
  state.settingsDraft.push({
    grupo: 'Atividades personalizadas',
    codigo: '',
    descricao: ''
  });
  renderSettingsCnaes();
  elements.settingsCnaeList.lastElementChild?.querySelector('input')?.focus();
}

async function saveSettings(event) {
  event.preventDefault();
  const issDefault = Number(elements.settingsIss.value);
  const cnaes = normalizeCnaes(state.settingsDraft);

  if (!Number.isFinite(issDefault) || issDefault < 0 || issDefault > 100) {
    setMessage(elements.settingsMessage, 'Informe um ISS entre 0% e 100%.', 'error');
    elements.settingsIss.focus();
    return;
  }

  if (!cnaes.length) {
    setMessage(elements.settingsMessage, 'Mantenha ao menos um CNAE na lista.', 'error');
    return;
  }

  const settings = { issDefault, cnaes };
  setBusy(elements.saveSettingsButton, true, 'Salvando...');

  try {
    if (state.localMode) {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } else {
      await callApi('salvarConfiguracao', { configuracao: settings });
    }

    applySettings(settings);
    elements.taxaISS.value = String(issDefault);
    updatePreview();
    closeSettings();
    setMessage(elements.statusMessage, 'Configurações atualizadas.', 'success');
  } catch (error) {
    setMessage(elements.settingsMessage, friendlyError(error, 'Não foi possível salvar.'), 'error');
  } finally {
    setBusy(elements.saveSettingsButton, false, 'Salvar');
  }
}

function normalizeCnaes(cnaes) {
  const unique = new Map();

  cnaes.forEach((item) => {
    const codigo = String(item?.codigo || '').trim();
    const descricao = String(item?.descricao || '').trim();
    if (!codigo || !descricao) return;
    const key = `${codigo.toLowerCase()}|${descricao.toLowerCase()}`;
    if (!unique.has(key)) {
      unique.set(key, {
        grupo: String(item?.grupo || 'Atividades personalizadas').trim(),
        codigo,
        descricao
      });
    }
  });

  return [...unique.values()];
}

function cloneCnaes(cnaes) {
  return cnaes.map((item) => ({ ...item }));
}

function cnaeValue(code, description) {
  return `${code} - ${description}`;
}

function updateCustomCnaeFields() {
  const isCustom = elements.cnae.value === OUTRO_CNAE;
  elements.customCnaeFields.hidden = !isCustom;
  elements.customCnaeCode.required = isCustom;
  elements.customCnaeDescription.required = isCustom;
}

function getSelectedCnae() {
  if (elements.cnae.value !== OUTRO_CNAE) {
    return elements.cnae.value;
  }

  const code = elements.customCnaeCode.value.trim();
  const description = elements.customCnaeDescription.value.trim();
  if (!code && !description) return 'Outro CNAE';
  return [code, description].filter(Boolean).join(' - ');
}

function newItem(values = {}) {
  return {
    id: values.id || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nome: Object.prototype.hasOwnProperty.call(values, 'nome')
      ? String(values.nome)
      : 'Honorários / serviços',
    detalhe: Object.prototype.hasOwnProperty.call(values, 'detalhe')
      ? String(values.detalhe)
      : '',
    valor: Number(values.valor) || 0
  };
}

function renderItemsEditor() {
  elements.itemsEditor.replaceChildren();

  state.items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const nameField = createItemField('Item', 'text', item.nome, 'Ex.: Honorários');
    const detailField = createItemField('Detalhamento', 'text', item.detalhe, 'Base ou cálculo');
    const valueField = createItemField('Valor', 'number', item.valor || '', '0,00');
    valueField.classList.add('currency-field');
    valueField.querySelector('input').min = '0';
    valueField.querySelector('input').step = '0.01';
    const currency = document.createElement('span');
    currency.textContent = 'R$';
    valueField.appendChild(currency);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-item-button';
    removeButton.type = 'button';
    removeButton.title = 'Remover item';
    removeButton.setAttribute('aria-label', `Remover item ${index + 1}`);
    removeButton.textContent = '×';

    nameField.querySelector('input').addEventListener('input', (event) => {
      item.nome = event.target.value;
      updatePreview();
    });
    detailField.querySelector('input').addEventListener('input', (event) => {
      item.detalhe = event.target.value;
      updatePreview();
    });
    valueField.querySelector('input').addEventListener('input', (event) => {
      item.valor = parseNumber(event.target.value);
      updatePreview();
    });
    removeButton.addEventListener('click', () => removeItem(item.id));

    row.append(nameField, detailField, valueField, removeButton);
    elements.itemsEditor.appendChild(row);
  });
}

function createItemField(labelText, type, value, placeholder) {
  const wrapper = document.createElement('div');
  wrapper.className = 'item-field';
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  if (type === 'text') input.maxLength = 160;
  wrapper.append(label, input);
  return wrapper;
}

function addItem() {
  if (state.items.length >= 12) {
    setMessage(elements.statusMessage, 'O orçamento pode ter até 12 itens.', 'error');
    return;
  }

  state.items.push(newItem({ nome: '', detalhe: '', valor: 0 }));
  renderItemsEditor();
  updatePreview();
  elements.itemsEditor.lastElementChild?.querySelector('input')?.focus();
}

function removeItem(id) {
  if (state.items.length === 1) {
    state.items[0] = newItem();
  } else {
    state.items = state.items.filter((item) => item.id !== id);
  }
  renderItemsEditor();
  updatePreview();
}

function calculateTotals() {
  const subtotal = state.items.reduce((sum, item) => sum + parseNumber(item.valor), 0);
  const rate = Math.max(0, parseNumber(elements.taxaISS.value));
  const iss = subtotal * (rate / 100);
  return { subtotal, rate, iss, total: subtotal + iss };
}

function updatePreview() {
  const totals = calculateTotals();
  const description = elements.descricaoServico.value.trim();
  const title = elements.tituloServico.value.trim();

  elements.docFolio.textContent = state.folio || 'Prévia';
  elements.docData.textContent = formatDate(elements.dataEmissao.value);
  elements.docCnae.textContent = getSelectedCnae() || '—';
  elements.docSolicitado.textContent = elements.solicitadoPor.value.trim() || '—';
  elements.docAutor.textContent = elements.autorOrcamento.value || '—';
  elements.docTituloServico.textContent = title || 'Título do serviço';
  elements.docDescricao.textContent = description || 'Descreva o serviço para visualizar a proposta.';

  elements.editorSubtotal.textContent = formatBRL(totals.subtotal);
  elements.editorIss.textContent = formatBRL(totals.iss);
  elements.editorTotal.textContent = formatBRL(totals.total);
  elements.docSubtotal.textContent = formatBRL(totals.subtotal);
  elements.docIssRate.textContent = `${formatDecimal(totals.rate)}%`;
  elements.docIss.textContent = formatBRL(totals.iss);
  elements.docTotal.textContent = formatBRL(totals.total);

  renderPreviewItems();
  renderConditions();
}

function renderPreviewItems() {
  elements.docItems.replaceChildren();
  const visibleItems = state.items.filter((item) => item.nome.trim() || item.valor > 0);
  const items = visibleItems.length ? visibleItems : [newItem()];

  items.forEach((item) => {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    const detail = document.createElement('td');
    const value = document.createElement('td');
    name.textContent = item.nome.trim() || 'Item do orçamento';
    detail.textContent = item.detalhe.trim() || '—';
    value.textContent = formatBRL(item.valor);
    row.append(name, detail, value);
    elements.docItems.appendChild(row);
  });
}

function renderConditions() {
  const conditions = [
    ['Realização prevista', elements.dataRealizacao.value.trim()],
    ['Local', elements.localRealizacao.value.trim()],
    ['Pagamento', elements.condicaoPagamento.value.trim()],
    ['E-mail para resposta', CONTACT_EMAIL],
    ['Validade do orçamento', `${parseInt(elements.validadeDias.value, 10) || 20} dias corridos a partir da emissão.`]
  ].filter(([, value]) => value);

  elements.docConditions.replaceChildren();
  conditions.forEach(([label, value]) => {
    const item = document.createElement('div');
    const span = document.createElement('span');
    const strong = document.createElement('strong');
    span.textContent = label;
    strong.textContent = value;
    item.append(span, strong);
    elements.docConditions.appendChild(item);
  });

  const exclusions = elements.naoInclusos.value.trim();
  elements.docNaoInclusos.hidden = !exclusions;
  elements.docNaoInclusos.replaceChildren();
  if (exclusions) {
    const strong = document.createElement('strong');
    strong.textContent = 'Não inclusos: ';
    elements.docNaoInclusos.append(strong, document.createTextNode(exclusions));
  }

  elements.docConditionsSection.hidden = !conditions.length && !exclusions;
}

function collectQuoteData(status) {
  const totals = calculateTotals();
  return {
    folio: state.folio,
    draftFileId: state.draftFileId,
    urlRascunho: state.draftUrl,
    operationId: state.saveOperationId,
    status,
    temaVisual: 'print',
    dataEmissao: elements.dataEmissao.value,
    autor: elements.autorOrcamento.value,
    cnae: getSelectedCnae(),
    solicitadoPor: elements.solicitadoPor.value.trim(),
    emailCliente: elements.emailCliente.value.trim(),
    tituloServico: elements.tituloServico.value.trim(),
    descricaoServico: elements.descricaoServico.value.trim(),
    itens: state.items.map((item) => ({
      nome: item.nome.trim(),
      detalhe: item.detalhe.trim(),
      valor: parseNumber(item.valor)
    })),
    subtotal: totals.subtotal,
    taxaISS: totals.rate,
    valorISS: totals.iss,
    valorTotal: totals.total,
    dataRealizacao: elements.dataRealizacao.value.trim(),
    localRealizacao: elements.localRealizacao.value.trim(),
    condicaoPagamento: elements.condicaoPagamento.value.trim(),
    validadeDias: parseInt(elements.validadeDias.value, 10) || 20,
    naoInclusos: elements.naoInclusos.value.trim(),
    enviadoEmail: elements.enviadoEmail.checked,
    pago: false,
    dataPagamento: ''
  };
}

function validateQuote(status) {
  clearValidation();
  const required = [
    elements.autorOrcamento,
    elements.dataEmissao,
    elements.solicitadoPor,
    elements.cnae,
    elements.tituloServico,
    elements.descricaoServico
  ];

  if (elements.cnae.value === OUTRO_CNAE) {
    required.push(elements.customCnaeCode, elements.customCnaeDescription);
  }

  const missing = required.find((field) => !String(field.value || '').trim());
  if (missing) {
    missing.setAttribute('aria-invalid', 'true');
    missing.focus();
    setMessage(elements.statusMessage, 'Preencha os campos essenciais antes de continuar.', 'error');
    return false;
  }

  if (!state.items.some((item) => item.nome.trim() && item.valor > 0)) {
    setMessage(elements.statusMessage, 'Inclua ao menos um item com valor maior que zero.', 'error');
    elements.itemsEditor.querySelector('input[type="number"]')?.focus();
    return false;
  }

  if (status === 'Enviado' && !elements.enviadoEmail.checked) {
    setMessage(
      elements.statusMessage,
      'Confirme que o orçamento foi enviado por contato@cordel2pontozero.com.',
      'error'
    );
    elements.enviadoEmail.focus();
    return false;
  }

  if (status === 'Enviado' && !elements.emailCliente.value.trim()) {
    elements.emailCliente.setAttribute('aria-invalid', 'true');
    elements.emailCliente.focus();
    setMessage(elements.statusMessage, 'Informe o e-mail do cliente antes de registrar o envio.', 'error');
    return false;
  }

  return true;
}

function clearValidation() {
  elements.quoteForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
    field.removeAttribute('aria-invalid');
  });
}

async function authenticate(password) {
  if (!password) {
    setMessage(elements.loginMessage, 'Digite a senha de acesso.', 'error');
    return;
  }

  setBusy(elements.loginButton, true, 'Entrando...');
  setMessage(elements.loginMessage, 'Verificando acesso...', '');

  try {
    const result = await callApi('login', { password });
    if (!result.accessToken) throw new Error('Não foi possível iniciar a sessão.');
    state.accessToken = result.accessToken;
    await loadSettings();
    sessionStorage.setItem(SESSION_KEY, state.accessToken);
    elements.senhaInput.value = '';
    enterApp();
  } catch (error) {
    state.accessToken = '';
    sessionStorage.removeItem(SESSION_KEY);
    setMessage(elements.loginMessage, friendlyError(error, 'Não foi possível entrar.'), 'error');
  } finally {
    setBusy(elements.loginButton, false, 'Entrar');
  }
}

async function resumeSession() {
  try {
    await callApi('validarSessao');
    await loadSettings();
    enterApp();
  } catch {
    state.accessToken = '';
    sessionStorage.removeItem(SESSION_KEY);
    setMessage(elements.loginMessage, 'Sua sessão expirou. Digite a senha novamente.', 'error');
  }
}

function enterApp() {
  elements.loginScreen.hidden = true;
  elements.appShell.hidden = false;
  elements.modeBadge.hidden = !state.localMode;
  if (!state.folio) elements.taxaISS.value = String(state.settings.issDefault);
  populateCnaes();
  updateCustomCnaeFields();
  updatePreview();
  hydrateRecordsCache();
  showView('gerador');
  refreshRecordsCache(true);
}

function logout() {
  if (!state.localMode && state.accessToken) {
    callApi('encerrarSessao').catch(() => {});
  }
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(RECORDS_CACHE_KEY);
  state.accessToken = '';
  state.localMode = false;
  window.location.reload();
}

function isBackendConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(GAS_URL);
}

async function saveQuote(status) {
  if (state.saving) return;
  if (!validateQuote(status)) return;

  const button = status === 'Rascunho' ? elements.saveDraftButton : elements.saveSentButton;
  state.saving = true;
  state.saveOperationId = state.saveOperationId || createOperationId();
  setQuoteSaving(true, button, status === 'Rascunho' ? 'Salvando...' : 'Gerando e salvando...');
  setMessage(elements.statusMessage, 'Preparando o orçamento...', '');

  try {
    const data = collectQuoteData(status);

    if (status === 'Enviado' && !state.localMode) {
      const pdfBlob = await createPdfBlob();
      data.pdfBase64 = await blobToBase64(pdfBlob);
    }

    const result = state.localMode
      ? saveLocalQuote(data)
      : await callApi('salvar', { dados: data });

    state.folio = result.folio;
    state.draftFileId = result.draftFileId || state.draftFileId;
    state.draftUrl = result.urlRascunho || state.draftUrl;
    state.saveOperationId = '';
    elements.docFolio.textContent = state.folio;
    elements.editorTitle.textContent = `Orçamento ${state.folio}`;
    setMessage(
      elements.statusMessage,
      status === 'Rascunho'
        ? `Rascunho ${state.folio} salvo com sucesso.`
        : `Orçamento ${state.folio} registrado como enviado.`,
      'success'
    );
    await refreshRecordsCache(true);
    await runPostSaveIntegrations({
      folio: state.folio,
      status,
      valorTotal: data.valorTotal
    });
  } catch (error) {
    setMessage(elements.statusMessage, friendlyError(error, 'Não foi possível salvar o orçamento.'), 'error');
  } finally {
    state.saving = false;
    setQuoteSaving(false);
  }
}

async function downloadPdf() {
  if (!validateQuote('Rascunho')) return;
  setBusy(elements.downloadPdfButton, true, 'Gerando...');
  setMessage(elements.statusMessage, 'Gerando o PDF...', '');

  try {
    if (typeof window.html2pdf !== 'function') {
      throw new Error('O gerador de PDF não foi carregado. Verifique sua conexão.');
    }
    const blob = await createPdfBlob();
    if (!blob || blob.size < 1000) {
      throw new Error('O PDF gerado ficou vazio. Tente novamente.');
    }
    downloadBlob(blob, exportFilename('pdf'));
    setMessage(elements.statusMessage, 'PDF gerado com sucesso.', 'success');
  } catch (error) {
    setMessage(elements.statusMessage, friendlyError(error, 'Não foi possível gerar o PDF.'), 'error');
  } finally {
    setBusy(elements.downloadPdfButton, false, 'Baixar PDF');
  }
}

async function downloadImage() {
  if (!validateQuote('Rascunho')) return;
  setBusy(elements.downloadImageButton, true, 'Gerando...');
  setMessage(elements.statusMessage, 'Gerando a imagem...', '');

  try {
    const blob = await createImageBlob();
    if (!blob || blob.size < 1000) {
      throw new Error('A imagem gerada ficou vazia. Tente novamente.');
    }
    downloadBlob(blob, exportFilename('png'));
    setMessage(elements.statusMessage, 'Imagem gerada com sucesso.', 'success');
  } catch (error) {
    setMessage(elements.statusMessage, friendlyError(error, 'Não foi possível gerar a imagem.'), 'error');
  } finally {
    setBusy(elements.downloadImageButton, false, 'Baixar imagem');
  }
}

async function createPdfBlob() {
  if (typeof window.html2pdf !== 'function') {
    throw new Error('O gerador de PDF não foi carregado.');
  }

  const exportDocument = await prepareExportDocument();
  try {
    return await window.html2pdf()
      .set(pdfOptions())
      .from(exportDocument.element)
      .outputPdf('blob');
  } finally {
    exportDocument.cleanup();
  }
}

async function createImageBlob() {
  if (typeof window.html2pdf !== 'function') {
    throw new Error('O gerador de imagem não foi carregado.');
  }

  const exportDocument = await prepareExportDocument();
  try {
    const worker = window.html2pdf()
      .set(pdfOptions())
      .from(exportDocument.element)
      .toCanvas();
    const canvas = await worker.get('canvas');
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Não foi possível finalizar a imagem.')),
        'image/png'
      );
    });
  } finally {
    exportDocument.cleanup();
  }
}

function pdfOptions() {
  return {
    margin: 0,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fffefb',
      logging: false,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['tr', '.document-header', '.document-signature']
    }
  };
}

async function prepareExportDocument() {
  updatePreview();
  if (document.fonts?.ready) await document.fonts.ready;

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'absolute',
    zIndex: '-1',
    top: '0',
    left: '0',
    width: '210mm',
    minHeight: '297mm',
    overflow: 'visible',
    pointerEvents: 'none',
    background: '#fffefb'
  });

  const clone = elements.quoteDocument.cloneNode(true);
  clone.removeAttribute('id');
  clone.classList.remove('theme-digital');
  clone.classList.add('theme-print', 'pdf-rendering', 'export-rendering');
  clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  host.appendChild(clone);
  document.body.appendChild(host);

  await Promise.all(
    [...clone.querySelectorAll('img')].map(async (image) => {
      if (!image.complete) {
        await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', reject, { once: true });
        });
      }
      if (typeof image.decode === 'function') {
        await image.decode().catch(() => {});
      }
    })
  );

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  return {
    element: clone,
    cleanup() {
      host.remove();
    }
  };
}

function exportFilename(extension) {
  const name = sanitizeFilename(elements.solicitadoPor.value || 'Cordel');
  const folio = state.folio || 'Previa';
  return `Orcamento_${folio}_${name}.${extension}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function runPostSaveIntegrations(context) {
  const integrations = window.CORDEL_INTEGRATIONS;
  if (!integrations?.enabled || typeof integrations.afterQuoteSaved !== 'function') return;

  try {
    await integrations.afterQuoteSaved(context);
  } catch (error) {
    console.warn('Integração opcional não executada:', error);
  }
}

async function blobToBase64(blob) {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < buffer.length; index += chunkSize) {
    binary += String.fromCharCode(...buffer.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
}

async function refreshRecordsCache(force = false) {
  const cacheIsFresh =
    state.recordsLoadedAt &&
    Date.now() - state.recordsLoadedAt < 15_000;
  if (!force && cacheIsFresh) return state.records;
  if (state.recordsPromise) return state.recordsPromise;

  state.recordsPromise = (async () => {
    try {
      state.records = state.localMode
        ? readLocalRecords()
        : await callApi('listar');
      state.recordsLoadedAt = Date.now();
      persistRecordsCache();
      updateDescriptionSuggestions();
      return state.records;
    } catch (error) {
      console.warn('Não foi possível atualizar o histórico:', error);
      return state.records;
    } finally {
      state.recordsPromise = null;
    }
  })();

  return state.recordsPromise;
}

function hydrateRecordsCache() {
  if (state.localMode || state.records.length) return;

  try {
    const cached = JSON.parse(sessionStorage.getItem(RECORDS_CACHE_KEY) || '{}');
    if (!Array.isArray(cached.records)) return;
    state.records = cached.records;
    state.recordsLoadedAt = Number(cached.savedAt) || 0;
    updateDescriptionSuggestions();
  } catch {
    sessionStorage.removeItem(RECORDS_CACHE_KEY);
  }
}

function persistRecordsCache() {
  if (state.localMode) return;

  try {
    sessionStorage.setItem(
      RECORDS_CACHE_KEY,
      JSON.stringify({
        savedAt: state.recordsLoadedAt || Date.now(),
        records: state.records
      })
    );
  } catch {
    // O cache é apenas uma otimização; a aplicação continua sem ele.
  }
}

function updateDescriptionSuggestions() {
  const currentCnae = getSelectedCnae();
  const unique = new Map();

  state.records.forEach((record) => {
    const data = recordData(record);
    if (
      data.cnae === currentCnae &&
      data.descricaoServico &&
      !unique.has(data.descricaoServico.trim())
    ) {
      unique.set(data.descricaoServico.trim(), {
        titulo: data.tituloServico || '',
        descricao: data.descricaoServico.trim()
      });
    }
  });

  state.suggestions = [...unique.values()];
  elements.descriptionSuggestion.replaceChildren();
  const initial = document.createElement('option');
  initial.value = '';
  initial.textContent = 'Escolha uma descrição anterior…';
  elements.descriptionSuggestion.appendChild(initial);

  state.suggestions.forEach((suggestion, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = suggestion.titulo || truncate(suggestion.descricao, 75);
    elements.descriptionSuggestion.appendChild(option);
  });

  elements.descriptionSuggestionField.hidden = state.suggestions.length === 0;
}

function applyDescriptionSuggestion() {
  if (elements.descriptionSuggestion.value === '') return;
  const suggestion = state.suggestions[Number(elements.descriptionSuggestion.value)];
  if (!suggestion) return;
  elements.tituloServico.value = suggestion.titulo;
  elements.descricaoServico.value = suggestion.descricao;
  updatePreview();
}

function showView(view) {
  const isGenerator = view === 'gerador';
  elements['view-gerador'].hidden = !isGenerator;
  elements['view-records'].hidden = isGenerator;

  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === view);
  });

  if (!isGenerator) {
    renderRecords(view);
  }
}

async function renderRecords(view) {
  const titles = {
    rascunhos: 'Rascunhos',
    enviados: 'Enviados',
    aceitos: 'Aceitos / execução'
  };
  const status = {
    rascunhos: 'rascunho',
    enviados: 'enviado',
    aceitos: 'aceito'
  };

  elements.recordsTitle.textContent = titles[view] || 'Orçamentos';
  elements.recordsList.replaceChildren();
  const hasCachedRecords = state.records.length > 0;
  if (hasCachedRecords) {
    paintRecordList(view, status[view]);
  } else {
    elements.recordsFeedback.hidden = false;
    elements.recordsFeedback.textContent = 'Buscando registros...';
  }

  try {
    await refreshRecordsCache();
    paintRecordList(view, status[view]);
  } catch (error) {
    elements.recordsFeedback.textContent = friendlyError(error, 'Não foi possível carregar os registros.');
  }
}

function paintRecordList(view, expectedStatus) {
  const records = state.records
    .filter(
      (record) =>
        String(
          record.Status ||
            record.status ||
            recordData(record).status ||
            ''
        ).toLowerCase() === expectedStatus
    )
    .sort(sortRecordsNewestFirst);

  elements.recordsList.replaceChildren();
  if (!records.length) {
    elements.recordsFeedback.hidden = false;
    elements.recordsFeedback.textContent = 'Nenhum orçamento nesta etapa.';
    return;
  }

  elements.recordsFeedback.hidden = true;
  records.forEach((record) => {
    elements.recordsList.appendChild(createRecordCard(record, view));
  });
}

function createRecordCard(record, view) {
  const data = recordData(record);
  const card = document.createElement('article');
  card.className = 'record-card';

  const clientBlock = recordBlock('Cliente', data.solicitadoPor || record.Cliente || '—', 'record-client');
  if (view === 'enviados' && isFollowUpDue(data, record)) {
    card.classList.add('has-follow-up');
    const alert = document.createElement('span');
    alert.className = 'follow-up-alert';
    alert.textContent = 'Retorno pendente há 5 dias úteis';
    clientBlock.appendChild(alert);
  }
  if (view === 'aceitos') {
    const execution = getExecutionVisualState(data, record);
    card.classList.add(`execution-${execution.kind}`);
    const badge = document.createElement('span');
    badge.className = `execution-status execution-status-${execution.kind}`;
    badge.textContent = execution.label;
    if (execution.error) badge.title = execution.error;
    clientBlock.appendChild(badge);
  }

  card.append(
    recordBlock('Fólio', data.folio || record.Folio || '—', 'record-folio'),
    clientBlock,
    recordBlock('Atualizado em', record['Atualizado em'] || record['Data Criação'] || '—', 'record-meta')
  );

  const value = document.createElement('div');
  value.className = 'record-value';
  value.textContent = formatBRL(data.valorTotal ?? record['Valor Total']);
  card.appendChild(value);

  if (view === 'aceitos') {
    card.appendChild(createPaymentEditor(record, data));
  } else {
    card.appendChild(createRecordActions(record, data, view));
  }

  return card;
}

function recordBlock(label, value, className) {
  const block = document.createElement('div');
  block.className = className;
  const span = document.createElement('span');
  const strong = document.createElement('strong');
  span.textContent = label;
  strong.textContent = value;
  strong.title = value;
  block.append(span, strong);
  return block;
}

function createRecordActions(record, data, view) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';

  const openButton = actionButton(view === 'rascunhos' ? 'Retomar' : 'Abrir', 'button-secondary');
  openButton.addEventListener('click', () => loadQuote(record));
  actions.appendChild(openButton);

  if (view === 'enviados') {
    const acceptButton = actionButton('Enviar para execução', 'button-primary');
    acceptButton.addEventListener('click', async () => {
      if (!window.confirm(`Enviar o orçamento ${data.folio} para execução?`)) return;
      setBusy(acceptButton, true, 'Enviando...');
      try {
        await updateRecordStatus(data.folio, 'Aceito');
      } catch (error) {
        elements.recordsFeedback.hidden = false;
        setMessage(elements.recordsFeedback, friendlyError(error, 'Não foi possível enviar para execução.'), 'error');
        setBusy(acceptButton, false, 'Enviar para execução');
      }
    });
    actions.appendChild(acceptButton);

    if (!Boolean(data.retornoCliente) && String(record['Retorno Cliente?']).toLowerCase() !== 'sim') {
      const returnButton = actionButton('Registrar retorno', 'button-secondary');
      returnButton.addEventListener('click', () => registerClientReturn(data.folio, returnButton));
      actions.appendChild(returnButton);
    }
  }

  const draftUrl = record['URL Rascunho'] || data.urlRascunho;
  if (view === 'rascunhos' && draftUrl) {
    const draftLink = document.createElement('a');
    draftLink.className = 'button button-dark';
    draftLink.href = draftUrl;
    draftLink.target = '_blank';
    draftLink.rel = 'noopener';
    draftLink.textContent = 'JSON';
    actions.appendChild(draftLink);
  }

  const pdfUrl = record['URL PDF'] || data.urlPdf;
  if (pdfUrl) {
    const link = document.createElement('a');
    link.className = 'button button-dark';
    link.href = pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'PDF';
    actions.appendChild(link);
  }

  return actions;
}

function createPaymentEditor(record, data) {
  const editor = document.createElement('div');
  editor.className = 'payment-editor';

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(data.pago) || String(record['Pago?']).toLowerCase() === 'sim';
  label.append(checkbox, document.createTextNode('Pago'));

  const date = document.createElement('input');
  date.type = 'date';
  date.value = normalizeDateInput(data.dataPagamento || record['Data Pagamento'] || '');
  date.disabled = !checkbox.checked;

  const save = actionButton('Salvar', 'button-primary');
  checkbox.addEventListener('change', () => {
    date.disabled = !checkbox.checked;
    if (checkbox.checked && !date.value) date.value = todayIso();
    if (!checkbox.checked) date.value = '';
  });
  save.addEventListener('click', async () => {
    setBusy(save, true, 'Salvando...');
    try {
      await updateRecordStatus(data.folio, 'Aceito', checkbox.checked, date.value, false);
      save.textContent = 'Salvo';
      setTimeout(() => {
        save.textContent = 'Salvar';
      }, 1400);
    } catch {
      save.textContent = 'Tentar novamente';
    } finally {
      save.disabled = false;
      save.classList.remove('is-loading');
      save.setAttribute('aria-busy', 'false');
    }
  });

  const open = actionButton('Abrir', 'button-secondary');
  open.addEventListener('click', () => loadQuote(record));

  editor.append(label, date, save, open);

  const executionUrl = record['URL Execução'] || data.urlExecucao;
  if (executionUrl) {
    const executionLink = document.createElement('a');
    executionLink.className = 'button button-dark';
    executionLink.href = executionUrl;
    executionLink.target = '_blank';
    executionLink.rel = 'noopener';
    executionLink.textContent = 'Execução';
    editor.appendChild(executionLink);
  }

  return editor;
}

function actionButton(text, variant) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button ${variant}`;
  button.textContent = text;
  return button;
}

async function updateRecordStatus(folio, newStatus, paid, paymentDate, refreshView = true) {
  if (!folio) throw new Error('Fólio não encontrado.');

  let result;
  if (state.localMode) {
    updateLocalStatus(folio, newStatus, paid, paymentDate);
    result = { sucesso: true, folio };
  } else {
    result = await callApi('atualizarStatus', {
      folio,
      novoStatus: newStatus,
      pago: paid,
      dataPagamento: paymentDate
    });
  }

  updateCachedRecordStatus(folio, newStatus, result);
  state.recordsLoadedAt = Date.now();
  if (refreshView) showView(newStatus === 'Aceito' ? 'aceitos' : 'enviados');
  return result;
}

function updateCachedRecordStatus(folio, newStatus, result = {}) {
  const record = state.records.find((item) => {
    const data = recordData(item);
    return String(data.folio || item.Folio || '') === String(folio);
  });
  if (!record) return;

  const data = recordData(record);
  data.status = newStatus;
  if (String(newStatus).toLowerCase() === 'aceito') {
    data.executionStatus = result.statusExecucao || 'Pendente';
    record['Status Execução'] = data.executionStatus;
  }
  record.Status = newStatus;
  record.JSON_Dados = JSON.stringify(data);
  persistRecordsCache();
}

async function registerClientReturn(folio, button) {
  setBusy(button, true, 'Registrando...');
  try {
    if (state.localMode) {
      const records = readLocalRecords();
      const record = records.find((item) => item.Folio === folio);
      if (!record) throw new Error('Fólio não encontrado.');
      const data = recordData(record);
      data.retornoCliente = true;
      data.dataRetornoCliente = todayIso();
      record['Retorno Cliente?'] = 'Sim';
      record.JSON_Dados = JSON.stringify(data);
      localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(records));
    } else {
      await callApi('registrarRetorno', { folio });
    }
    await refreshRecordsCache(true);
    showView('enviados');
  } catch (error) {
    elements.recordsFeedback.hidden = false;
    setMessage(elements.recordsFeedback, friendlyError(error, 'Não foi possível registrar o retorno.'), 'error');
    setBusy(button, false, 'Registrar retorno');
  }
}

function isFollowUpDue(data, record) {
  if (Boolean(data.retornoCliente) || String(record['Retorno Cliente?']).toLowerCase() === 'sim') {
    return false;
  }

  const value = data.followUpDate || record['Follow-up em'];
  if (!value) return false;
  const due = new Date(`${normalizeDateInput(value)}T23:59:59`);
  return !Number.isNaN(due.getTime()) && due.getTime() <= Date.now();
}

function getExecutionVisualState(data, record) {
  const status = String(
    data.executionStatus ||
    record['Status Execução'] ||
    (data.urlExecucao || record['URL Execução'] ? 'Pronto' : 'Pendente')
  ).toLowerCase();
  const error = data.executionError || record['Erro Execução'] || '';

  if (status === 'pronto') {
    return { kind: 'ready', label: 'Em execução', error: '' };
  }
  if (status === 'erro') {
    return { kind: 'error', label: 'Execução com pendência', error };
  }
  if (status === 'processando') {
    return { kind: 'processing', label: 'Preparando execução', error: '' };
  }
  return { kind: 'pending', label: 'Execução na fila', error: '' };
}

function loadQuote(record) {
  const data = recordData(record);
  state.folio = data.folio || record.Folio || '';
  state.draftFileId = data.draftFileId || '';
  state.draftUrl = data.urlRascunho || record['URL Rascunho'] || '';
  state.items = normalizeItems(data.itens, data);

  elements.autorOrcamento.value = data.autor || elements.autorOrcamento.options[0].value;
  elements.dataEmissao.value = normalizeDateInput(data.dataEmissao) || todayIso();
  elements.solicitadoPor.value = data.solicitadoPor || '';
  elements.emailCliente.value = data.emailCliente || '';
  setCnaeValue(data.cnae || '');
  elements.tituloServico.value = data.tituloServico || '';
  elements.descricaoServico.value = data.descricaoServico || '';
  elements.taxaISS.value = Number.isFinite(Number(data.taxaISS)) ? data.taxaISS : 5;
  elements.dataRealizacao.value = data.dataRealizacao || '';
  elements.validadeDias.value = data.validadeDias || 20;
  elements.localRealizacao.value = data.localRealizacao || '';
  elements.condicaoPagamento.value = data.condicaoPagamento || 'Via Pix (chave CNPJ), mediante emissão de nota fiscal.';
  elements.naoInclusos.value = data.naoInclusos || '';
  elements.enviadoEmail.checked = Boolean(data.enviadoEmail) || String(record['Enviado Email?']).toLowerCase() === 'sim';
  elements.editorTitle.textContent = `Orçamento ${state.folio}`;

  renderItemsEditor();
  updateCustomCnaeFields();
  updateDescriptionSuggestions();
  updatePreview();
  setMessage(elements.statusMessage, `Orçamento ${state.folio} carregado para edição.`, 'success');
  showView('gerador');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setCnaeValue(value) {
  const optionExists = [...elements.cnae.options].some((option) => option.value === value);
  if (optionExists) {
    elements.cnae.value = value;
    elements.customCnaeCode.value = '';
    elements.customCnaeDescription.value = '';
    return;
  }

  elements.cnae.value = OUTRO_CNAE;
  const match = String(value).match(/^([0-9.\\/-]+)\s*-\s*(.+)$/);
  elements.customCnaeCode.value = match?.[1] || '';
  elements.customCnaeDescription.value = match?.[2] || value;
}

function normalizeItems(items, data) {
  if (Array.isArray(items) && items.length) {
    return items.map((item) => newItem(item));
  }

  const total = parseNumber(data.valorTotal);
  const rate = parseNumber(data.taxaISS) || 5;
  const base = parseNumber(data.subtotal) || (total ? total / (1 + rate / 100) : 0);
  return [newItem({ nome: 'Honorários / serviços', valor: base })];
}

function resetQuote(confirmReset) {
  const hasContent = elements.solicitadoPor.value.trim() || elements.descricaoServico.value.trim() || calculateTotals().subtotal > 0;
  if (confirmReset && hasContent && !window.confirm('Limpar este orçamento e começar um novo?')) {
    return;
  }

  state.folio = '';
  state.draftFileId = '';
  state.draftUrl = '';
  state.saveOperationId = '';
  state.items = [newItem()];
  elements.quoteForm.reset();
  elements.dataEmissao.value = todayIso();
  elements.validadeDias.value = '20';
  elements.taxaISS.value = String(state.settings.issDefault);
  elements.condicaoPagamento.value = 'Via Pix (chave CNPJ), mediante emissão de nota fiscal.';
  elements.tituloServico.value = 'Minicurso de escrita criativa, literatura popular e IA generativa';
  elements.editorTitle.textContent = 'Novo orçamento';
  renderItemsEditor();
  updateCustomCnaeFields();
  updateDescriptionSuggestions();
  updatePreview();
  setMessage(elements.statusMessage, '', '');
}

async function callApi(action, payload = {}) {
  if (!isBackendConfigured()) throw new Error('A URL do Apps Script ainda não foi configurada.');

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action,
      accessToken: state.accessToken,
      ...payload
    })
  });

  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('O backend respondeu em um formato inesperado.');
  }

  if (!response.ok || result.sucesso === false || result.erro) {
    throw new Error(result.erro || `Erro ${response.status}`);
  }

  return result.dados ?? result;
}

function saveLocalQuote(data) {
  const records = readLocalRecords();
  const now = new Date().toLocaleString('pt-BR');

  if (!data.folio) {
    const max = records.reduce((value, record) => {
      const number = parseInt(String(record.Folio || '').replace(/\D/g, ''), 10);
      return Number.isFinite(number) ? Math.max(value, number) : value;
    }, 9);
    data.folio = String(max + 1).padStart(5, '0');
  }

  const record = {
    Folio: data.folio,
    Status: data.status,
    'Data Criação': now,
    'Atualizado em': now,
    Cliente: data.solicitadoPor,
    'Email Cliente': data.emailCliente || '',
    CNAE: data.cnae,
    Autor: data.autor,
    'Valor Total': data.valorTotal,
    'Enviado Email?': data.enviadoEmail ? 'Sim' : 'Não',
    'Pago?': data.pago ? 'Sim' : 'Não',
    'Data Pagamento': data.dataPagamento || '',
    'URL PDF': '',
    'URL Rascunho': data.urlRascunho || '',
    'Follow-up em': data.followUpDate || '',
    'Retorno Cliente?': data.retornoCliente ? 'Sim' : 'Não',
    'URL Execução': data.urlExecucao || '',
    JSON_Dados: JSON.stringify(data)
  };

  const existing = records.findIndex((item) => item.Folio === data.folio);
  if (existing >= 0) {
    record['Data Criação'] = records[existing]['Data Criação'];
    records[existing] = record;
  } else {
    records.push(record);
  }

  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(records));
  state.records = records;
  return { sucesso: true, folio: data.folio };
}

function readLocalRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(LOCAL_RECORDS_KEY) || '[]');
    if (!Array.isArray(records)) return [];
    const unique = new Map();
    records.forEach((record) => {
      const folio = String(record?.Folio || recordData(record).folio || '').trim();
      if (!folio || !unique.has(folio)) {
        unique.set(folio || `sem-folio-${unique.size}`, record);
        return;
      }

      const previous = unique.get(folio);
      const previousDate = String(previous['Atualizado em'] || previous['Data Criação'] || '');
      const currentDate = String(record['Atualizado em'] || record['Data Criação'] || '');
      if (currentDate.localeCompare(previousDate) >= 0) unique.set(folio, record);
    });
    return [...unique.values()];
  } catch {
    return [];
  }
}

function updateLocalStatus(folio, status, paid, paymentDate) {
  const records = readLocalRecords();
  const record = records.find((item) => item.Folio === folio);
  if (!record) throw new Error('Fólio não encontrado.');

  const data = recordData(record);
  data.status = status;
  if (String(status).toLowerCase() === 'aceito' && !data.executionStatus) {
    data.executionStatus = 'Pendente';
    record['Status Execução'] = 'Pendente';
  }
  if (paid !== undefined) data.pago = paid;
  if (paymentDate !== undefined) data.dataPagamento = paymentDate || '';

  record.Status = status;
  record['Pago?'] = data.pago ? 'Sim' : 'Não';
  record['Data Pagamento'] = data.dataPagamento || '';
  record['Atualizado em'] = new Date().toLocaleString('pt-BR');
  record.JSON_Dados = JSON.stringify(data);
  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(records));
}

function recordData(record) {
  if (record?.dados && typeof record.dados === 'object') return record.dados;
  if (record?.JSON_Dados && typeof record.JSON_Dados === 'object') return record.JSON_Dados;

  try {
    return JSON.parse(record?.JSON_Dados || '{}');
  } catch {
    return {
      folio: record?.Folio || '',
      status: record?.Status || '',
      solicitadoPor: record?.Cliente || '',
      emailCliente: record?.['Email Cliente'] || '',
      cnae: record?.CNAE || '',
      autor: record?.Autor || '',
      valorTotal: parseNumber(record?.['Valor Total']),
      enviadoEmail: String(record?.['Enviado Email?']).toLowerCase() === 'sim',
      pago: String(record?.['Pago?']).toLowerCase() === 'sim',
      dataPagamento: record?.['Data Pagamento'] || '',
      followUpDate: record?.['Follow-up em'] || '',
      retornoCliente: String(record?.['Retorno Cliente?']).toLowerCase() === 'sim',
      urlExecucao: record?.['URL Execução'] || '',
      executionStatus: record?.['Status Execução'] || '',
      executionError: record?.['Erro Execução'] || ''
    };
  }
}

function sortRecordsNewestFirst(a, b) {
  return String(b['Atualizado em'] || b['Data Criação'] || '').localeCompare(
    String(a['Atualizado em'] || a['Data Criação'] || '')
  );
}

function setToday() {
  if (!elements.dataEmissao.value) elements.dataEmissao.value = todayIso();
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function normalizeDateInput(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(parseNumber(value));
}

function formatDecimal(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Number(value) % 1 ? 1 : 0,
    maximumFractionDigits: 2
  }).format(parseNumber(value));
}

function setMessage(element, message, type) {
  element.textContent = message;
  element.classList.toggle('is-success', type === 'success');
  element.classList.toggle('is-error', type === 'error');
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = label;
  button.classList.toggle('is-loading', busy);
  button.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function setQuoteSaving(busy, activeButton, activeLabel) {
  elements.quoteForm.setAttribute('aria-busy', busy ? 'true' : 'false');
  elements.saveDraftButton.disabled = busy;
  elements.saveSentButton.disabled = busy;
  elements.newQuoteButton.disabled = busy;

  if (busy && activeButton) {
    setBusy(activeButton, true, activeLabel);
    return;
  }

  setBusy(elements.saveDraftButton, false, 'Salvar rascunho');
  setBusy(elements.saveSentButton, false, 'Salvar como enviado');
}

function createOperationId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `save-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function friendlyError(error, fallback) {
  if (!error) return fallback;
  if (/Failed to fetch|NetworkError/i.test(error.message)) {
    return 'Não foi possível acessar o backend. Confira a implantação do Apps Script.';
  }
  return error.message || fallback;
}

function sanitizeFilename(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 70) || 'Cordel';
}

function truncate(value, length) {
  const text = String(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}
