Risposte Personalizzate:

Funzione getPersonalizedAdvice() adatta i consigli in base a:
Età: <30 (rischio), 30-50 (bilanciato), >50 (sicurezza).
Obiettivo: "pensione", "casa", "viaggi" o altro, con suggerimenti specifici.
Esempi concreti con calcoli (es. ETF al 5-7% per i giovani).

Suggerimenti Automatici:
Funzione addSuggestion() verifica condizioni come:
Immobili > 70% del totale → suggerisce liquidità.
Conto corrente > 50% → suggerisce investimenti.
Risparmio < 5% del reddito → suggerisce un piano.

Dopo l’analisi, appare un messaggio con opzioni "Sì/No" dopo 2 secondi.

Le risposte ai suggerimenti sono gestite in sendMessage()

Salvataggio con localStorage:
addMessage e editMessage salvano messageHistory, step e userData in localStorage.

Funzione loadSavedData() carica i dati salvati all’avvio:
Ripristina la chat e i dati utente.

Se step > 8, rigenera i grafici.

All’apertura, se ci sono dati salvati, chiede "Continuare" o "Ripartire".



