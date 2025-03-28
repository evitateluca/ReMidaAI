# ReMida AI - Documento Riassuntivo delle Funzionalità

## Panoramica
ReMida AI è un assistente virtuale che raccoglie dati personali (conto corrente, immobili, obbligazioni, risparmio mensile, età, reddito annuo, orizzonte temporale, obiettivo) e offre analisi, grafici e consigli personalizzati per gestire il patrimonio.

---

## Funzionalità Principali

### 1. Raccolta Dati (9 Passaggi)
- **Input Utente**: Conto corrente, immobili, obbligazioni, risparmio mensile, età, reddito annuo, orizzonte temporale, obiettivo.
- **Interfaccia**: Chat interattiva con risposte rapide ("Sì", "No", opzioni predefinite).
- **Progresso**: Barra di progresso visibile (Passaggio 1 di 9 → 9 di 9).
- **Tutorial**: Modale iniziale al primo avvio con istruzioni base.

---

### 2. Analisi Personalizzata

#### Adatta i Consigli in Base a:
- **Età**:
  - **< 30 anni**: Rischio alto → "Investi il 30% del conto corrente in ETF azionari (5-7% annuo)".  
    *Esempio*: 10.000€ al 6% annuo → 600€ dopo 1 anno, 11.910€ dopo 3 anni (1.06³).
  - **30-50 anni**: Bilanciato → "Sposta il 20% del conto corrente in ETF obbligazionari (2% annuo)".  
    *Esempio*: 10.000€ al 2% annuo → 200€ dopo 1 anno, 10.612€ dopo 3 anni (1.02³).
  - **> 50 anni**: Sicurezza → "Metti il 15% del conto corrente in titoli di Stato o fondi a basso rischio".  
    *Esempio*: 10.000€ al 1% annuo → 100€ dopo 1 anno, 10.303€ dopo 3 anni (1.01³).

- **Obiettivo**:
  - **"Pensione"**: "Avvia un PAC con il 60% del risparmio mensile su un fondo bilanciato".  
    *Esempio*: 200€/mese al 5% annuo → 12.600€ in 5 anni.
  - **"Casa"**: "Risparmia il 20% del reddito mensile netto e valuta un fondo immobiliare".  
    *Esempio*: Reddito annuo 30.000€ → 500€/mese, 30.000€ in 5 anni (senza rendimenti).
  - **"Viaggi"**: "Investi il 10% del conto corrente in un ETF flessibile".  
    *Esempio*: 5.000€ al 4% annuo → 5.200€ dopo 1 anno, 6.083€ dopo 5 anni (1.04⁵).
  - **Altro**: "Fondo diversificato con il 50% del risparmio mensile".  
    *Esempio*: 300€/mese al 5% annuo → 18.900€ in 5 anni.

#### Verifica Condizioni:
- **Immobili > 70% del totale**: "Hai troppi immobili, considera di affittare (es. 500€/mese = 6.000€/anno) o vendere il 20% e investire (es. 20.000€ al 5% = 23.152€ in 3 anni)".
- **Conto corrente > 50% del totale**: "Troppa liquidità ferma, investi il 20% in un ETF (es. 10.000€ al 6% = 11.910€ in 3 anni)".
- **Risparmio mensile < 5% del reddito annuo**: "Risparmi poco, riduci le spese del 10% (es. reddito 30.000€ → 250€/mese in più) e mettili in un PAC (es. 250€/mese al 5% = 15.750€ in 5 anni)".

---

### 3. Grafici e Visualizzazioni
- **Patrimonio Totale**: Proiezione a 3 anni con risparmio e inflazione (es. 50.000€ + 200€/mese al 5% - 2% inflazione).
- **Sicurezza**: Doughnut con indice (0-100%) basato su inflazione, illiquidità, ecc.
- **Inflazione**: Barra con perdita annuale (es. 10.000€ al 2% = 200€/anno).
- **Liquidità**: Pie chart (liquido vs illiquido, es. 70% immobili = "bloccato").
- **Distribuzione**: Pie chart delle asset (conto, immobili, obbligazioni).
- **ETF**: Crescita simulata (es. 20% del conto al 2% annuo).
- **PAC**: Crescita simulata (es. 60% del risparmio al 5% annuo).

---

### 4. Strumenti Aggiuntivi
- **Glossario**: Spiegazioni semplici (ETF, PAC, inflazione, obbligazioni, liquidità).
- **Calcolatore PAC**: Input personalizzati (importo iniziale, tasso, mensile, anni) con grafico.
- **Simulazione Scenari**: Confronto multiplo:
  - Base (2% infl., 5% rend.).
  - Inflazione Alta (5% infl., 5% rend., 1% tasse).
  - Mercato in Crescita (2% infl., 8% rend., alta volatilità).
  - Crisi (3% infl., 2% rend., -10% anno 1).
  - Personalizzato (utente definisce parametri).
- **Esporta PDF**: Report con analisi e grafici.

---

### 5. Esperienza Utente
- **Tutorial Iniziale**: Guida al primo avvio.
- **Barra di Progresso**: Mostra avanzamento (1-9).
- **Tema Chiaro/Scuro**: Adatta colori automaticamente.
- **Menu Hamburger**: Accesso rapido a glossario, calcolatore, simulazioni, PDF.

---

## Esempio Completo
**Utente**: 28 anni, 20.000€ conto, 10.000€ immobili, 0€ obbligazioni, 300€/mese risparmio, 35.000€ reddito, 10 anni orizzonte, obiettivo "pensione".  
- **Totale**: 30.000€.  
- **Consiglio**: "Investi 6.000€ (30%) in ETF al 6% → 9.547€ in 5 anni. PAC con 180€/mese (60%) al 5% → 11.340€ in 5 anni".  
- **Condizioni**: Conto > 50% (66%) → "Sposta 4.000€ in ETF".  
- **Grafici**: Sicurezza 85%, Inflazione 400€/anno, Liquidità 66% liquido.
