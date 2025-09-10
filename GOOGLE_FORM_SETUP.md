# Setup Google Form per Caricamento Foto/Video

## Passaggi per creare il Google Form

### 1. Crea nuovo Google Form
- Vai su [https://forms.google.com/](https://forms.google.com/)
- Clicca "Blank" per creare un nuovo form
- Titolo: "Carica foto/video – Pompei 2025 (Fede e Luce)"

### 2. Configura le sezioni del form

#### Sezione 1: Dati Personali
- **Nome e cognome** (Short answer, Required)
- **Email** (Short answer, Required, Email validation)
- **Comunità / Città** (Short answer, Required)
- **Consenso utilizzo immagini** (Checkbox, Required)
  - Testo: "Consento l'utilizzo delle mie immagini per scopi promozionali del pellegrinaggio"

#### Sezione 2: Contenuti
- **Foto** (File upload, Required)
  - Descrizione: "Carica le tue foto del pellegrinaggio (max 10 file, JPG/PNG)"
  - Max files: 10
  - Max size: 10MB per file
- **Video** (File upload, Optional)
  - Descrizione: "Carica video del pellegrinaggio (MP4, max 100MB)"
  - Max files: 3
  - Max size: 100MB per file
- **Descrizione breve** (Paragraph, Optional)
  - Descrizione: "Racconta brevemente il momento o il contesto (max 500 caratteri)"

#### Sezione 3: Privacy e Consensi
- **Consenso minori** (Checkbox, Required)
  - Testo: "Confermo di non aver caricato volti di minori senza consenso scritto dei genitori"
- **Informativa privacy** (Checkbox, Required)
  - Testo: "Ho letto e accetto l'informativa sulla privacy"
  - Link: [Informativa Privacy](#)

### 3. Impostazioni del form
- **Responses**: Salva su Google Sheets
- **Settings**:
  - Collect email addresses: ON
  - Limit to 1 response: OFF
  - Show progress bar: ON
  - Shuffle question order: OFF

### 4. Personalizzazione
- **Theme**: Colori Fede e Luce
- **Header image**: Logo del pellegrinaggio
- **Description**: "Condividi la tua esperienza del pellegrinaggio a Pompei"

### 5. Configura Google Sheets
- Crea nuovo Google Sheet per le risposte
- Nome: "Contributi Pellegrinaggio Pompei 2025"
- Aggiungi colonna "APPROVATO" (Sì/No) per moderazione

### 6. Test del form
- Compila il form di test
- Verifica che i file vengano caricati correttamente
- Controlla che le risposte arrivino nel Google Sheet

## Integrazione nel sito

### URL del form
Una volta creato, il form avrà un URL simile a:
`https://docs.google.com/forms/d/e/[FORM_ID]/viewform`

### Embed nel sito
Puoi usare l'embed diretto o un link:

```html
<!-- Opzione 1: Link diretto -->
<a href="https://docs.google.com/forms/d/e/[FORM_ID]/viewform" 
   target="_blank" 
   rel="noopener" 
   class="btn btn-primary">
   Apri il modulo di caricamento
</a>

<!-- Opzione 2: Embed iframe -->
<iframe src="https://docs.google.com/forms/d/e/[FORM_ID]/viewform?embedded=true" 
        width="100%" 
        height="1200" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0">
  Caricamento…
</iframe>
```

## Note importanti

- **Privacy**: I file vengono salvati su Google Drive
- **Moderazione**: Controlla sempre i contenuti prima di approvarli
- **Storage**: Google Drive ha limiti di spazio, monitora l'uso
- **Formato**: Accetta solo JPG, PNG, MP4 per sicurezza

## Prossimi passi

1. Crea il form seguendo questi passaggi
2. Testa il caricamento di file
3. Configura la moderazione nel Google Sheet
4. Integra l'URL nel sito (partecipa.html)
5. Crea Google Apps Script per automatizzare l'approvazione (opzionale)
