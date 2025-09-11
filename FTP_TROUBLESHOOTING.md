# FTP Deployment Troubleshooting

## Errore 530 - Diagnosi e Soluzioni

### Problema
```
FTPError: 530 Errore critico: impossibile collegarsi al server, 
verificare i dati di autenticazione usati e la corretta configurazione 
del filtro accessi ftp se attivo
```

### Cause Possibili

1. **Protocollo non sicuro**: Il server richiede FTPS/SFTP
2. **Credenziali errate**: Username/password non corretti
3. **Filtro IP**: Il server blocca le IP di GitHub Actions
4. **Timeout**: Connessione troppo lenta (10 minuti di attesa)
5. **Configurazione server**: Il server ha cambiato policy di sicurezza

### Soluzioni Implementate

#### 1. Configurazione FTPS (Principale)
```yaml
protocol: ftps
port: 21
timeout: 300000
retry-count: 3
retry-wait: 5000
log-level: verbose
```

#### 2. Workflow Backup SFTP
- File: `.github/workflows/deploy-backup.yml`
- Utilizzabile manualmente con `workflow_dispatch`
- Supporta sia SFTP che FTP standard

### Verifica Credenziali

1. **Controlla i secrets GitHub**:
   - `FTP_USERNAME`: deve essere il nome utente corretto
   - `FTP_PASSWORD`: deve essere la password corretta (senza spazi extra)

2. **Testa connessione manuale**:
   ```bash
   # Test FTPS
   ftp ftp.fedeeluce.it
   # Usa comando: AUTH TLS
   
   # Test SFTP (se supportato)
   sftp ftp.fedeeluce.it
   ```

3. **Verifica con Aruba**:
   - Controlla se il server richiede IP whitelist
   - Verifica se è attivo un filtro accessi
   - Controlla se le credenziali sono scadute

### Test di Deployment

1. **Prima prova**: Push su `main` (usa configurazione FTPS)
2. **Se fallisce**: Usa workflow manuale con SFTP
3. **Monitora i log**: `log-level: verbose` mostrerà dettagli errori

### Alternative se FTP non funziona

1. **SFTP**: Porta 22, protocollo sicuro
2. **FTPS Implicito**: Porta 990
3. **FTPS Esplicito**: Porta 21 (quello implementato)

### Contatto Supporto Aruba

Se i problemi persistono, contatta Aruba per:
- Verificare configurazione server FTP
- Controllare filtri IP per GitHub Actions
- Confermare protocolli supportati
- Verificare stato account FTP

### Log di Debug

I log verbose mostreranno:
- Tentativi di connessione
- Errori specifici del protocollo
- Tempi di risposta
- Dettagli autenticazione
