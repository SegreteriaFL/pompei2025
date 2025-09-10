# Google Apps Script per Automatizzazione Album

## Setup Google Apps Script

### 1. Apri il Google Sheet delle risposte
- Vai al Google Sheet creato per il form
- Clicca su "Extensions" > "Apps Script"

### 2. Crea nuovo script
- Cancella il codice esistente
- Incolla il codice qui sotto
- Salva con nome: "Album Pompei 2025"

### 3. Configura le variabili
Nel codice, aggiorna queste variabili:
- `SHEET_NAME`: Nome del foglio (es. "Form Responses 1")
- `FORM_ID`: ID del Google Form
- `WEB_APP_URL`: URL che otterrai dopo il deploy

### 4. Deploy come Web App
- Clicca "Deploy" > "New deployment"
- Type: "Web app"
- Execute as: "Me"
- Who has access: "Anyone with the link"
- Clicca "Deploy"
- Copia l'URL generato

### 5. Aggiorna album.html
Sostituisci l'URL nel file `album.html` con l'URL della Web App.

## Codice Apps Script

```javascript
/** Config **/
const CONFIG = {
  SHEET_NAME: 'Form Responses 1', // Nome del foglio delle risposte
  // Riconoscimento colonne per nome (case-insensitive)
  COLS: {
    nome: /nome.*cognome|nome/i,
    email: /mail/i,
    comunita: /comunit|citt|gruppo/i,
    descrizione: /descriz|note/i,
    approvato: /approv|modera/i,
    foto: /foto/i,
    video: /video/i
  },
  // Se true, rende pubblici i file su Drive
  FORCE_PUBLIC: true
};

/** Endpoint pubblico: GET → JSON */
function doGet() {
  const out = buildItems_();
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

/** Core: legge sheet, filtra APPROVATO, espone uno item per file */
function buildItems_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) return [];
  
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  
  const headers = values[0].map(String);
  
  // Mappa indici colonne
  const idx = {};
  headers.forEach((h, i) => {
    const H = h.trim();
    for (const key in CONFIG.COLS) {
      if (!idx[key] && CONFIG.COLS[key].test(H)) idx[key] = i;
    }
  });
  
  const rows = values.slice(1);
  const items = [];
  
  rows.forEach(r => {
    const approv = idx.approvato != null ? String(r[idx.approvato] || '').toLowerCase() : 'sì';
    if (!/s[iìi]|yes|ok|true/.test(approv)) return;
    
    const base = {
      nome: idx.nome != null ? String(r[idx.nome] || '').trim() : '',
      comunita: idx.comunita != null ? String(r[idx.comunita] || '').trim() : '',
      note: idx.descrizione != null ? String(r[idx.descrizione] || '').trim() : ''
    };
    
    // Foto
    if (idx.foto != null && r[idx.foto]) {
      parseLinks_(String(r[idx.foto])).forEach(id => {
        if (CONFIG.FORCE_PUBLIC) setPublic_(id);
        items.push(Object.assign({}, base, {
          type: 'image',
          url: viewUrl_(id),
          alt: base.note || 'Foto pellegrinaggio'
        }));
      });
    }
    
    // Video
    if (idx.video != null && r[idx.video]) {
      parseLinks_(String(r[idx.video])).forEach(id => {
        if (CONFIG.FORCE_PUBLIC) setPublic_(id);
        items.push(Object.assign({}, base, {
          type: 'video',
          url: viewUrl_(id),
          alt: base.note || 'Video pellegrinaggio'
        }));
      });
    }
  });
  
  return items;
}

/** Estrae ID file da link Drive multipli */
function parseLinks_(cell) {
  return cell
    .split(/[,;\n]+/)
    .map(s => s.trim())
    .map(s => {
      let m = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/); if (m) return m[1];
      m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);        if (m) return m[1];
      m = s.match(/\/d\/([a-zA-Z0-9_-]+)/);          if (m) return m[1];
      return null;
    })
    .filter(Boolean);
}

/** Rende pubblico il file (anyone with link, view) */
function setPublic_(id) {
  try {
    const f = DriveApp.getFileById(id);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {
    console.log('Errore nel rendere pubblico il file:', id, e);
  }
}

/** URL visualizzazione inline (immagini/video) */
function viewUrl_(id) {
  return 'https://drive.google.com/uc?export=view&id=' + id;
}

/** Test function per verificare il funzionamento */
function test() {
  const items = buildItems_();
  console.log('Items trovati:', items.length);
  console.log('Primo item:', items[0]);
  return items;
}
```

## Aggiornamento album.html

Sostituisci il JavaScript in `album.html` con:

```javascript
(async function(){
  const ENDPOINT = 'https://script.google.com/macros/s/[SCRIPT_ID]/exec'; // URL Web App
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store' });
    const items = await res.json();
    const grid = document.getElementById('albumGrid');
    
    if (items.length === 0) {
      grid.innerHTML = '<p class="no-content">Nessun contributo ancora approvato. I tuoi contributi saranno pubblicati dopo la moderazione.</p>';
      return;
    }
    
    grid.innerHTML = items.map(it => `
      <figure class="album-card">
        ${it.type === 'video'
          ? `<iframe src="${it.url.replace('uc?export=view','file/d')+'/preview'}" allowfullscreen loading="lazy"></iframe>`
          : `<img src="${it.url}" alt="${it.alt || 'Contributo'}" loading="lazy">`}
        <figcaption>
          <strong>${it.nome || 'Anonimo'}</strong>
          ${it.comunita ? `<div class="meta">${it.comunita}</div>` : ''}
          ${it.note ? `<p>${it.note}</p>` : ''}
        </figcaption>
      </figure>
    `).join('');
  } catch(e){ 
    console.error('Album load error', e);
    document.getElementById('albumGrid').innerHTML = '<p class="error">Errore nel caricamento dell\'album. Riprova più tardi.</p>';
  }
})();
```

## CSS aggiuntivo per video

Aggiungi al CSS:

```css
.album-card iframe { 
  width: 100%; 
  height: 220px; 
  border: 0; 
  display: block; 
}

.no-content, .error {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
  font-style: italic;
}
```

## Note importanti

- **Sicurezza**: Il script rende pubblici i file su Drive
- **Performance**: I file vengono caricati on-demand
- **Moderazione**: Solo i contributi con "APPROVATO = Sì" vengono mostrati
- **Backup**: I file originali rimangono nel Google Drive dell'account

## Troubleshooting

- Se il JSON è vuoto: controlla che ci siano contributi approvati
- Se i file non si vedono: verifica che siano pubblici su Drive
- Se l'endpoint non funziona: controlla i permessi della Web App
