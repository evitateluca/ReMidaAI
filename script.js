let userData = { 
    contoCorrente: null, 
    immobili: null, 
    obbligazioni: null, 
    risparmioMensile: null, 
    eta: null, 
    redditoAnnuo: null, 
    orizzonteTemporale: null, 
    obiettivo: null 
};
let step = 0;
let chartsDrawn = false;

function addMessage(message, sender) {
    const chatbox = document.getElementById('chatbox');
    const p = document.createElement('p');
    p.innerHTML = message; // Use innerHTML to render HTML content
    p.className = sender;
    chatbox.appendChild(p);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function addTypingIndicator() {
    addMessage("ReMida sta scrivendo...", 'typing');
}

function removeTypingIndicator() {
    const chatbox = document.getElementById('chatbox');
    const typing = chatbox.querySelector('.typing');
    if (typing) typing.remove();
}

function addQuickReplies(options) {
    const quickReplies = document.getElementById('quickReplies');
    quickReplies.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => {
            document.getElementById('userInput').value = option;
            sendMessage();
        };
        quickReplies.appendChild(btn);
    });
}

function clearQuickReplies() {
    document.getElementById('quickReplies').innerHTML = '';
}

function drawCharts(safetyIndex, inflazione, illiquidita, total) {
    if (chartsDrawn) return;

    new Chart(document.getElementById('safetyChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Sicurezza', 'Rischio'], datasets: [{ data: [safetyIndex, 100 - safetyIndex], backgroundColor: ['#2ecc71', '#e74c3c'] }] },
        options: { plugins: { legend: { display: false }, title: { display: true, text: `Sicurezza: ${safetyIndex}%` } } }
    });

    new Chart(document.getElementById('inflationChart').getContext('2d'), {
        type: 'bar',
        data: { labels: ['Perdita Annuale'], datasets: [{ label: 'Inflazione', data: [inflazione], backgroundColor: '#ff9800' }] },
        options: { scales: { y: { beginAtZero: true } }, plugins: { title: { display: true, text: 'Perdita per Inflazione (€)' } } }
    });

    new Chart(document.getElementById('liquidityChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['Liquido', 'Illiquido'], datasets: [{ data: [100 - illiquidita, illiquidita], backgroundColor: ['#4caf50', '#f44336'] }] },
        options: { plugins: { title: { display: true, text: `Illiquidità: ${illiquidita.toFixed(0)}%` } } }
    });

    new Chart(document.getElementById('assetChart').getContext('2d'), {
        type: 'pie',
        data: { 
            labels: ['Conto Corrente', 'Immobili', 'Obbligazioni'], 
            datasets: [{ data: [userData.contoCorrente, userData.immobili, userData.obbligazioni || 0], backgroundColor: ['#2196f3', '#9c27b0', '#ffeb3b'] }] 
        },
        options: { plugins: { title: { display: true, text: 'Distribuzione Patrimonio' } } }
    });

    const etfAmount = userData.contoCorrente * 0.2;
    const etfGrowth = [etfAmount, etfAmount * 1.02, etfAmount * 1.02 ** 2, etfAmount * 1.02 ** 3];
    new Chart(document.getElementById('etfGrowthChart').getContext('2d'), {
        type: 'line',
        data: { 
            labels: ['Oggi', '1 anno', '2 anni', '3 anni'], 
            datasets: [{ label: 'ETF', data: etfGrowth, borderColor: '#2196f3', fill: false }] 
        },
        options: { plugins: { title: { display: true, text: 'Crescita ETF (2% annuo)' } } }
    });

    const pacMonthly = userData.risparmioMensile * 0.6;
    const pacGrowth = [0, pacMonthly * 12 * 1.05, pacMonthly * 24 * 1.05 ** 2, pacMonthly * 36 * 1.05 ** 3];
    new Chart(document.getElementById('pacGrowthChart').getContext('2d'), {
        type: 'line',
        data: { 
            labels: ['Oggi', '1 anno', '2 anni', '3 anni'], 
            datasets: [{ label: 'PAC', data: pacGrowth, borderColor: '#4caf50', fill: false }] 
        },
        options: { plugins: { title: { display: true, text: 'Crescita PAC (5% annuo)' } } }
    });

    chartsDrawn = true;
}

function analyzeData() {
    const total = userData.contoCorrente + userData.immobili + (userData.obbligazioni || 0);
    const inflazione = userData.contoCorrente * 0.02;
    const illiquidita = (userData.immobili / total) * 100;
    let safetyIndex = 100;
    if (inflazione > 1000) safetyIndex -= 10;
    if (illiquidita > 50) safetyIndex -= 20;
    if (userData.obbligazioni && (userData.obbligazioni * 0.01 - userData.obbligazioni * 0.02) < 0) safetyIndex -= 10;
    if (userData.risparmioMensile < userData.redditoAnnuo * 0.05) safetyIndex -= 5;
    if (userData.eta > 50 && illiquidita > 70) safetyIndex -= 10;

    const reply = `
Ecco come stanno i tuoi soldi: hai <strong>${total.toLocaleString('it-IT')}€</strong> totali.

- <strong>Inflazione</strong>: perdi <strong>${inflazione.toFixed(0)}€ all’anno</strong> sul conto corrente.
- <strong>Illiquidità</strong>: il <strong>${illiquidita.toFixed(0)}%</strong> del tuo patrimonio è fermo.
- <strong>Indice di Sicurezza</strong>: <strong>${safetyIndex}%</strong>.

<strong>Cosa puoi fare?</strong>
- Sposta <strong>${(userData.contoCorrente * 0.2).toFixed(0)}€</strong> in un ETF obbligazionario a basso rischio (+2% annuo) per proteggere dall’inflazione.
- Con <strong>${(userData.risparmioMensile * 0.6).toFixed(0)}€ al mese</strong>, avvia un PAC su un fondo azionario globale.
- Il tuo patrimonio è troppo fermo: considera di affittare o vendere una parte degli immobili.
- Le obbligazioni non rendono abbastanza: valuta un fondo bilanciato o ETF diversificato.
- Con il tuo orizzonte di <strong>${userData.orizzonteTemporale} anni</strong>, punta su strumenti sicuri ma con un po’ di crescita, come fondi misti.

Ti va di approfondire? Dimmi "Sì"!
`;
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(reply, 'bot');
        addQuickReplies(['Sì', 'No']);
        drawCharts(safetyIndex, inflazione, illiquidita, total);
    }, 1500); // Ritardo di 1,5 secondi
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    clearQuickReplies();

    switch (step) {
        case 0: // Inizio
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    addMessage("Fantastico! Partiamo dalle basi: quanti soldi hai sul conto corrente?", 'bot');
                    step = 1;
                } else {
                    addMessage("Nessun problema, quando vuoi dire 'Sì' sono qui!", 'bot');
                    addQuickReplies(['Sì']);
                }
            }, 1000);
            break;

        case 1: // Conto corrente
            userData.contoCorrente = parseFloat(message);
            if (isNaN(userData.contoCorrente) || userData.contoCorrente < 0) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Mi serve un numero valido, puoi riprovare?", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Ok, perfetto! E quanto valgono i tuoi immobili, se ne hai?", 'bot');
                    step = 2;
                }, 1000);
            }
            break;

        case 2: // Immobili
            userData.immobili = parseFloat(message);
            if (isNaN(userData.immobili) || userData.immobili < 0) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Inserisci un numero valido, per favore!", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Hai obbligazioni o altri investimenti? Quanto valgono? (Scrivi 0 se non ne hai)", 'bot');
                    step = 3;
                }, 1000);
            }
            break;

        case 3: // Obbligazioni
            userData.obbligazioni = parseFloat(message);
            if (isNaN(userData.obbligazioni) || userData.obbligazioni < 0) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Ci vuole un numero valido, riprova!", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Quanto riesci a mettere da parte ogni mese? Il tuo risparmio mensile?", 'bot');
                    step = 4;
                }, 1000);
            }
            break;

        case 4: // Risparmio mensile
            userData.risparmioMensile = parseFloat(message);
            if (isNaN(userData.risparmioMensile) || userData.risparmioMensile < 0) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Dammi un numero valido, dai!", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Quanti anni hai? Mi aiuta a capire meglio la tua situazione.", 'bot');
                    step = 5;
                }, 1000);
            }
            break;

        case 5: // Età
            userData.eta = parseInt(message);
            if (isNaN(userData.eta) || userData.eta < 18 || userData.eta > 120) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Inserisci un’età realistica, per favore!", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Qual è il tuo reddito annuo netto? (Es. 30000)", 'bot');
                    step = 6;
                }, 1000);
            }
            break;

        case 6: // Reddito annuo
            userData.redditoAnnuo = parseFloat(message);
            if (isNaN(userData.redditoAnnuo) || userData.redditoAnnuo < 0) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Serve un numero valido per il reddito, riprova!", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Per quanti anni vuoi pianificare il tuo futuro finanziario? (Es. 10, 20)", 'bot');
                    step = 7;
                }, 1000);
            }
            break;

        case 7: // Orizzonte temporale
            userData.orizzonteTemporale = parseInt(message);
            if (isNaN(userData.orizzonteTemporale) || userData.orizzonteTemporale < 1) {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Inserisci un numero di anni valido, ok?", 'bot');
                }, 1000);
            } else {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage("Ultimo passo: qual è il tuo obiettivo principale? (Es. pensione, casa, viaggi)", 'bot');
                    step = 8;
                }, 1000);
            }
            break;

        case 8: // Obiettivo
            userData.obiettivo = message;
            addTypingIndicator();
            step = 9;
            analyzeData();
            break;

        case 9: // Dopo analisi
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    const extraReply = `
Ok, approfondiamo per il tuo obiettivo "${userData.obiettivo}":

- ${userData.obiettivo.toLowerCase().includes('pensione') ? 
    `Con ${userData.orizzonteTemporale} anni davanti, potresti mettere ${(userData.redditoAnnuo * 0.15 / 12).toFixed(0)}€ al mese in un fondo pensione.` : 
    userData.obiettivo.toLowerCase().includes('casa') ? 
    `Risparmia almeno ${(userData.redditoAnnuo * 0.2 / 12).toFixed(0)}€ al mese per un anticipo in ${userData.orizzonteTemporale} anni.` : 
    "Punta su investimenti flessibili, come un fondo bilanciato, per il tuo obiettivo."}
- Una polizza vita o un’assicurazione sul patrimonio potrebbe darti più tranquillità.

Vuoi rifare tutto con dati diversi? Dimmi "Sì"!
                    `;
                    addMessage(extraReply, 'bot');
                    addQuickReplies(['Sì', 'No']);
                } else {
                    addMessage("Grazie per avermi usato! Se vuoi ripartire, dimmi 'Sì'.", 'bot');
                    addQuickReplies(['Sì']);
                    step = 0;
                    chartsDrawn = false;
                }
            }, 1500);
            break;
    }
}

addMessage("Ciao! Sono ReMida AI, il tuo consulente finanziario personale. Vuoi dare un’occhiata al tuo patrimonio? Dimmi 'Sì' quando sei pronto!", 'bot');
addQuickReplies(['Sì']);