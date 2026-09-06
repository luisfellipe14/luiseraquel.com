// Dedicated wedding domain; all public assets resolve from the site root.
export const siteConfig = {
  basePath: '',
  origin: 'https://luiseraquel.com',
  // URL /exec do Apps Script da planilha de confirmações (vazio = só WhatsApp). Ver README.
  rsvpEndpoint:
    'https://script.google.com/macros/s/AKfycbzCIeIOd9eqlq1tLENppN_3KG92TaIgz9RGX2aeIUiEPRgcUVDRO9SzYTN6WKTNthW7xg/exec',
};
