/**
 * Resumo de preenchimento da NFS-e (Nota Salvador) a partir de um orçamento.
 *
 * Carrega data/cnae-fiscal.json (fonte única dos códigos CNAE → item da
 * lista, CTISS, NBS, indicador de operação e classificação tributária),
 * resolve o CNAE do orçamento e monta um painel espelhando a ordem dos
 * campos do formulário do Nota Salvador, com botão de copiar em cada valor.
 *
 * Apenas consulta e formatação: nada é emitido nem enviado, e nenhum dado
 * digitado aqui é salvo. Não substitui a conferência contábil.
 */
window.CORDEL_NFSE = (function () {
  const NOTA_SALVADOR_URL = 'https://nfse.salvador.ba.gov.br/site/contribuinte/nota/nota.aspx';
  const DISCRIMINACAO_LIMITE = 2000;

  let DADOS = null;
  let carregamento = null;
  let eventosLigados = false;

  async function carregar() {
    if (DADOS) return DADOS;
    if (!carregamento) {
      carregamento = fetch('data/cnae-fiscal.json', { cache: 'no-store' })
        .then((resposta) => {
          if (!resposta.ok) {
            throw new Error('Não foi possível carregar data/cnae-fiscal.json.');
          }
          return resposta.json();
        })
        .then((json) => {
          DADOS = json;
          return DADOS;
        })
        .catch((erro) => {
          carregamento = null;
          throw erro;
        });
    }
    return carregamento;
  }

  function normalizarCnae(valor) {
    return String(valor || '').replace(/\D/g, '').slice(0, 7);
  }

  function encontrarCnae(valor) {
    if (!DADOS) return null;
    const alvo = normalizarCnae(valor);
    if (alvo.length < 7) return null;
    return DADOS.cnaes.find((item) => normalizarCnae(item.cnae) === alvo) || null;
  }

  // Retorna o bloco fiscal de um CNAE. itemLC opcional (ex.: "17.10"); senão usa o default.
  function resolverFiscal(cnae, itemLC) {
    const registro = encontrarCnae(cnae);
    if (!registro) return null;
    const servico = itemLC
      ? registro.servicos.find((item) => item.item === itemLC)
      : (registro.servicos.find((item) => item.default) || registro.servicos[0]);
    return servico
      ? { cnae: registro.cnae, descricaoCnae: registro.descricao, ...servico }
      : null;
  }

  function servicosDoCnae(cnae) {
    const registro = encontrarCnae(cnae);
    return registro ? registro.servicos : [];
  }

  function esc(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatarAliquota(valor) {
    const numero = Number(valor);
    return (Number.isFinite(numero) ? numero : 5).toFixed(2).replace('.', ',');
  }

  function formatarValorCampo(valor) {
    const numero = Number(valor);
    return (Number.isFinite(numero) ? numero : 0).toFixed(2).replace('.', ',');
  }

  function formatarBRL(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(Number(valor) || 0);
  }

  function campoCopiavel(rotulo, valor, opcoes = {}) {
    const aviso = opcoes.aviso
      ? ' <em class="nfse-aviso">conferir</em>'
      : '';
    const texto = String(valor || '').trim();
    const conteudo = texto
      ? `<span class="nfse-valor" data-copiavel>${esc(texto)}</span>`
      : '<span class="nfse-valor"><i class="nfse-falta-texto">— preencher no sistema —</i></span>';
    const botao = texto
      ? '<button class="nfse-copiar" type="button" title="Copiar valor">copiar</button>'
      : '';
    return `
      <div class="nfse-campo">
        <span class="nfse-rotulo">${esc(rotulo)}${aviso}</span>
        ${conteudo}
        ${botao}
      </div>`;
  }

  function campoEditavel(rotulo, id, valor, opcoes = {}) {
    const texto = String(valor || '').trim();
    const faltando = opcoes.obrigatorio && !texto;
    const dica = opcoes.dica ? `<small class="nfse-dica">${esc(opcoes.dica)}</small>` : '';
    return `
      <div class="nfse-campo${faltando ? ' nfse-falta' : ''}"${opcoes.obrigatorio ? ' data-obrigatorio' : ''}>
        <span class="nfse-rotulo">${esc(rotulo)}</span>
        <span class="nfse-valor">
          <input type="text" id="${esc(id)}" value="${esc(texto)}" placeholder="${esc(opcoes.placeholder || '')}" data-copiavel>
          ${dica}
        </span>
        <button class="nfse-copiar" type="button" title="Copiar valor">copiar</button>
      </div>`;
  }

  function montarDiscriminacao(data, fiscal) {
    const partes = [];
    if (fiscal && fiscal.descServico) partes.push(`${fiscal.descServico}.`);
    const referencia = [`Referente ao orçamento ${data.folio || 's/ fólio'}`];
    if (data.tituloServico) referencia.push(`— ${data.tituloServico}`);
    partes.push(`${referencia.join(' ')}.`);
    const itens = (data.itens || [])
      .filter((item) => String(item.nome || '').trim())
      .map((item) => item.detalhe ? `${item.nome} (${item.detalhe})` : item.nome)
      .join('; ');
    if (itens) partes.push(`Itens: ${itens}.`);
    if (data.descricaoServico) partes.push(data.descricaoServico);
    return partes.join(' ').slice(0, DISCRIMINACAO_LIMITE);
  }

  function blocoServicoHtml(fiscal, data) {
    if (!fiscal) {
      return `
        <p class="nfse-alerta">
          CNAE fora da lista fiscal da Cordel 2.0 (<strong>${esc(data.cnae || '—')}</strong>).
          Preencha os códigos manualmente no Nota Salvador — nenhum código foi sugerido.
        </p>
        ${campoCopiavel('CÓDIGO DO CNAE / ITEM DA LISTA DE SERVIÇOS', '')}
        ${campoCopiavel('Aliq. (%)', '')}
        ${campoCopiavel('CÓDIGO DE TRIBUTAÇÃO MUNICIPAL - CTISS', '')}
        ${campoCopiavel('NBS', '')}
        ${campoCopiavel('Indicador de Operação', '')}
        ${campoCopiavel('Classificação Tributária', '')}`;
    }

    const indicadorPadrao = DADOS.indicadorOperacaoPadrao || {};
    const classificacaoPadrao = DADOS.classificacaoTributariaPadrao || {};
    const descIndicador = fiscal.cIndOp === indicadorPadrao.codigo
      ? indicadorPadrao.descricao
      : '';
    const descClassificacao = fiscal.cClassTrib === classificacaoPadrao.codigo
      ? classificacaoPadrao.descricao
      : '';
    const conferir = Boolean(fiscal.revisar) ||
      String(fiscal.nbsStatus || '').toLowerCase() !== 'confirmado';

    return `
      <p class="nfse-cnae-origem">CNAE do orçamento: <strong>${esc(fiscal.cnae)}</strong> — ${esc(fiscal.descricaoCnae)}</p>
      ${campoCopiavel('CÓDIGO DO CNAE / ITEM DA LISTA DE SERVIÇOS', `${fiscal.codServico} - ${fiscal.descServico}`)}
      <div class="nfse-campo">
        <span class="nfse-rotulo">Aliq. (%)</span>
        <span class="nfse-valor">
          <input type="text" id="nfseAliquota" value="${esc(formatarAliquota(fiscal.aliquota))}" data-copiavel>
          <small class="nfse-dica">Regime normal: 5,00. No Simples Nacional, confirmar a alíquota com a contabilidade.</small>
        </span>
        <button class="nfse-copiar" type="button" title="Copiar valor">copiar</button>
      </div>
      ${campoCopiavel('CÓDIGO DE TRIBUTAÇÃO MUNICIPAL - CTISS', `${fiscal.ctissFmt} - ${fiscal.descCtiss}`)}
      ${campoCopiavel('NBS', `${fiscal.nbs} - ${fiscal.descNbs}`, { aviso: conferir })}
      ${campoCopiavel('Indicador de Operação', descIndicador ? `${fiscal.cIndOp} - ${descIndicador}` : fiscal.cIndOp)}
      ${campoCopiavel('Classificação Tributária', descClassificacao ? `${fiscal.cClassTrib} - ${descClassificacao}` : fiscal.cClassTrib)}`;
  }

  function abrirPainel(container, data, record = {}) {
    if (!DADOS) {
      throw new Error('Dados fiscais ainda não carregados. Chame CORDEL_NFSE.carregar() antes.');
    }

    const prestador = DADOS.prestador || {};
    const servicos = servicosDoCnae(data.cnae);
    let fiscal = resolverFiscal(data.cnae);
    let discriminacaoEditada = false;

    const seletorServico = servicos.length > 1
      ? `
        <div class="nfse-campo">
          <span class="nfse-rotulo">Serviço deste CNAE</span>
          <span class="nfse-valor">
            <select id="nfseServico">
              ${servicos.map((servico) => `
                <option value="${esc(servico.item)}"${fiscal && servico.item === fiscal.item ? ' selected' : ''}>
                  ${esc(`${servico.item} — ${servico.descServico}`)}
                </option>`).join('')}
            </select>
            <small class="nfse-dica">Este CNAE aceita mais de um item da lista. Trocar a opção atualiza CTISS, NBS e indicadores.</small>
          </span>
        </div>`
      : '';

    const valorTotal = Number(data.valorTotal) || 0;
    const itensHtml = (data.itens || [])
      .filter((item) => String(item.nome || '').trim())
      .map((item) => `<li>${esc(item.nome)}${item.detalhe ? ` <span>(${esc(item.detalhe)})</span>` : ''} — ${esc(formatarBRL(item.valor))}</li>`)
      .join('');

    container.innerHTML = `
      <div class="nfse-painel" id="nfsePainel">
        <p class="nfse-banner">
          Resumo de apoio ao preenchimento manual no Nota Salvador — <strong>sem valor fiscal</strong>.
          Confira os valores com a contabilidade antes de emitir.
        </p>

        <section class="nfse-bloco">
          <h3>Prestador de serviços</h3>
          ${campoCopiavel('CNPJ', prestador.cnpj)}
          ${campoCopiavel('Razão social', prestador.razaoSocial)}
          ${campoCopiavel('Tributação dos serviços', prestador.tributacao)}
          ${campoCopiavel('Local de prestação — UF', prestador.uf)}
          ${campoCopiavel('Local de prestação — Cidade', prestador.municipio)}
        </section>

        <section class="nfse-bloco">
          <h3>Tomador de serviços</h3>
          <p class="nfse-dica-bloco">
            Campos em vermelho são exigidos pelo Nota Salvador e não constam no orçamento.
            O que você digitar aqui serve apenas para copiar — nada é salvo.
          </p>
          ${campoEditavel('CNPJ / CPF', 'nfseTomadorDocumento', '', { obrigatorio: true, placeholder: '00.000.000/0000-00' })}
          ${campoEditavel('Razão social / Nome', 'nfseTomadorNome', data.solicitadoPor || record.Cliente || '', { obrigatorio: true })}
          ${campoEditavel('CEP', 'nfseTomadorCep', '', { obrigatorio: true, placeholder: '00000-000' })}
          ${campoEditavel('Estado', 'nfseTomadorEstado', '', { obrigatorio: true, placeholder: 'BA' })}
          ${campoEditavel('Cidade', 'nfseTomadorCidade', '', { obrigatorio: true })}
          ${campoEditavel('Bairro', 'nfseTomadorBairro', '', { obrigatorio: true })}
          ${campoEditavel('Tipo', 'nfseTomadorTipo', '', { obrigatorio: true, placeholder: 'Rua' })}
          ${campoEditavel('Logradouro', 'nfseTomadorLogradouro', '', { obrigatorio: true })}
          ${campoEditavel('Número', 'nfseTomadorNumero', '', { obrigatorio: true })}
          ${campoEditavel('Complemento', 'nfseTomadorComplemento', '')}
          ${campoEditavel('Inscrição Estadual', 'nfseTomadorInscricao', '', { dica: 'Quase sempre vazio para tomador de serviços.' })}
          ${campoEditavel('E-mail', 'nfseTomadorEmail', data.emailCliente || '')}
          ${campoEditavel('Apelido', 'nfseTomadorApelido', '', { dica: 'Nome curto para reutilizar o cadastro no Nota Salvador.' })}
        </section>

        <section class="nfse-bloco">
          <h3>Serviço</h3>
          ${seletorServico}
          <div id="nfseBlocoServico">${blocoServicoHtml(fiscal, data)}</div>
        </section>

        <section class="nfse-bloco">
          <h3>Discriminação dos serviços</h3>
          <div class="nfse-campo nfse-campo-textarea">
            <span class="nfse-rotulo">Texto sugerido</span>
            <span class="nfse-valor">
              <textarea id="nfseDiscriminacao" rows="6" maxlength="${DISCRIMINACAO_LIMITE}" data-copiavel>${esc(montarDiscriminacao(data, fiscal))}</textarea>
              <small class="nfse-dica"><span id="nfseDiscriminacaoContador"></span> — mesmo limite do campo no Nota Salvador.</small>
            </span>
            <button class="nfse-copiar" type="button" title="Copiar valor">copiar</button>
          </div>
        </section>

        <section class="nfse-bloco">
          <h3>Valores</h3>
          ${campoCopiavel('Valor total da nota (R$)', formatarValorCampo(valorTotal))}
          ${campoCopiavel('ISS retido pelo tomador', 'Não')}
          <p class="nfse-dica-bloco">
            Total do orçamento: <strong>${esc(formatarBRL(valorTotal))}</strong>
            (subtotal ${esc(formatarBRL(data.subtotal))} + ISS ${esc(formatarBRL(data.valorISS))} a ${esc(formatarAliquota(data.taxaISS))}%).
            O Nota Salvador calcula o ISS sobre o valor informado na nota.
          </p>
          ${itensHtml ? `<ul class="nfse-itens">${itensHtml}</ul>` : ''}
        </section>

        <div class="nfse-acoes">
          <a class="button button-dark" href="${NOTA_SALVADOR_URL}" target="_blank" rel="noopener">Abrir Nota Salvador</a>
          <button class="button button-secondary" id="nfsePdfButton" type="button">Baixar PDF do resumo</button>
        </div>
      </div>`;

    const painel = container.querySelector('#nfsePainel');
    const discriminacao = painel.querySelector('#nfseDiscriminacao');
    const contador = painel.querySelector('#nfseDiscriminacaoContador');
    const blocoServico = painel.querySelector('#nfseBlocoServico');
    const seletor = painel.querySelector('#nfseServico');

    const atualizarContador = () => {
      contador.textContent = `Caracteres restantes: ${DISCRIMINACAO_LIMITE - discriminacao.value.length}`;
    };
    atualizarContador();
    discriminacao.addEventListener('input', () => {
      discriminacaoEditada = true;
      atualizarContador();
    });

    if (seletor) {
      seletor.addEventListener('change', () => {
        fiscal = resolverFiscal(data.cnae, seletor.value);
        blocoServico.innerHTML = blocoServicoHtml(fiscal, data);
        if (!discriminacaoEditada) {
          discriminacao.value = montarDiscriminacao(data, fiscal);
          atualizarContador();
        }
      });
    }

    painel.querySelector('#nfsePdfButton').addEventListener('click', () => {
      gerarPdf(painel, data.folio || record.Folio || 'previa');
    });

    ligarEventosGlobais();
    return painel;
  }

  function ligarEventosGlobais() {
    if (eventosLigados) return;
    eventosLigados = true;

    document.addEventListener('click', (event) => {
      const botao = event.target.closest('.nfse-copiar');
      if (!botao) return;
      const campo = botao.closest('.nfse-campo');
      const origem = campo && campo.querySelector('[data-copiavel]');
      if (!origem) return;
      const valor = 'value' in origem && origem.tagName !== 'SPAN'
        ? origem.value
        : origem.textContent;
      navigator.clipboard.writeText(String(valor || '').trim()).then(() => {
        const rotulo = botao.textContent;
        botao.textContent = 'copiado ✓';
        botao.classList.add('is-copied');
        setTimeout(() => {
          botao.textContent = rotulo === 'copiado ✓' ? 'copiar' : rotulo;
          botao.classList.remove('is-copied');
        }, 1100);
      }).catch(() => {
        window.prompt('Copie o valor manualmente:', String(valor || '').trim());
      });
    });

    document.addEventListener('input', (event) => {
      const campo = event.target.closest('.nfse-campo[data-obrigatorio]');
      if (!campo) return;
      campo.classList.toggle('nfse-falta', !String(event.target.value || '').trim());
    });
  }

  async function gerarPdf(painel, folio) {
    if (typeof window.html2pdf !== 'function') {
      window.alert('O gerador de PDF não foi carregado.');
      return;
    }

    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    Object.assign(host.style, {
      position: 'absolute',
      zIndex: '-1',
      top: '0',
      left: '0',
      width: '210mm',
      background: '#ffffff',
      pointerEvents: 'none'
    });

    const clone = painel.cloneNode(true);
    clone.classList.add('nfse-print');
    clone.querySelectorAll('[id]').forEach((elemento) => elemento.removeAttribute('id'));

    // Congela o que foi digitado: troca inputs/textareas/selects por texto simples.
    const origens = painel.querySelectorAll('input, textarea, select');
    const clones = clone.querySelectorAll('input, textarea, select');
    origens.forEach((origem, indice) => {
      const alvo = clones[indice];
      if (!alvo) return;
      const texto = origem.tagName === 'SELECT'
        ? (origem.selectedOptions[0]?.textContent || '').trim()
        : String(origem.value || '').trim();
      const substituto = document.createElement(origem.tagName === 'TEXTAREA' ? 'div' : 'span');
      substituto.className = 'nfse-valor-impresso';
      substituto.textContent = texto || '— preencher no sistema —';
      alvo.replaceWith(substituto);
    });

    const marca = document.createElement('div');
    marca.className = 'nfse-watermark';
    marca.textContent = 'SEM VALOR FISCAL';
    clone.prepend(marca);

    const titulo = document.createElement('p');
    titulo.className = 'nfse-print-titulo';
    titulo.textContent = `Resumo NFS-e — Fólio ${folio} — Cordel 2.0 Inova Simples (I.S.)`;
    clone.prepend(titulo);

    host.appendChild(clone);
    document.body.appendChild(host);

    try {
      await window.html2pdf()
        .set({
          margin: 8,
          filename: `Resumo-NFSe_${folio}.pdf`,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.nfse-campo'] }
        })
        .from(clone)
        .save();
    } finally {
      host.remove();
    }
  }

  return {
    carregar,
    resolverFiscal,
    servicosDoCnae,
    abrirPainel,
    get dados() {
      return DADOS;
    }
  };
})();
