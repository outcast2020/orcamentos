/**
 * Ponto de extensão do frontend para integrações futuras.
 *
 * Não coloque tokens, chaves bancárias ou outros segredos neste arquivo:
 * tudo que é publicado no GitHub Pages pode ser lido publicamente.
 *
 * Integrações como emissão fiscal ou QR Code Pix deverão ser executadas
 * pelo Google Apps Script. O frontend receberá somente o resultado seguro.
 */
window.CORDEL_INTEGRATIONS = Object.freeze({
  version: 1,
  enabled: false,
  providers: Object.freeze([]),

  async afterQuoteSaved() {
    return { enabled: false };
  }
});
