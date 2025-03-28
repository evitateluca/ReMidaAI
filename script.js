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
let messageHistory = [];
let charts = {};
let suggestionActive = false;
let suggestionStep = 0;
let lastSuggestion = null;
let calculatorChart = null;
let simulationChart = null;
const totalSteps = 9;

const glossary = {
    "etf": "Un ETF (Exchange Traded Fund) è un fondo di investimento negoziato in borsa, come un’azione. Replica un indice (es. S&P 500) ed è un modo semplice per investire in molti titoli con costi bassi. Esempio: investi 1000€ in un ETF azionario e cresci del 5% annuo!",
    "pac": "Un PAC (Piano di Accumulo Capitale) è un metodo per investire una somma fissa ogni mese (es. 200€) in un fondo o ETF. Riduce il rischio comprando a prezzi diversi nel tempo. Esempio: 200€/mese al 5% annuo diventano 13.000€ in 5 anni.",
    "inflazione": "L’inflazione è l’aumento dei prezzi nel tempo, che riduce il potere d’acquisto dei tuoi soldi. Se hai 10.000€ sul conto e l’inflazione è al 2%, perdi 200€ di valore all’anno se non investi!",
    "obbligazioni": "Le obbligazioni sono prestiti che fai a un’azienda o governo, che ti ripagano con interessi. Sono meno rischiose delle azioni, ma rendono meno. Esempio: 1000€ in obbligazioni al 2% ti danno 20€ all’anno.",
    "liquidità": "La liquidità è la facilità con cui puoi accedere ai tuoi soldi. Il conto corrente è liquido (puoi usarlo subito), gli immobili no (devi venderli). Troppa liquidità può perdere valore con l’inflazione!"
};

function addMessage(message, sender, stepIndex = null) {
    const chatbox = document.getElementById('chatbox');
    const p = document.createElement('p');
    p.innerHTML = message;
    p.className = sender;
    if (sender === 'user') {
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => editMessage(p, stepIndex);
        p.appendChild(editBtn);
    }
    chatbox.appendChild(p);
    chatbox.scrollTop = chatbox.scrollHeight;
    if (stepIndex !== null) {
        messageHistory[stepIndex] = { message, sender, step: stepIndex };
        localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
        localStorage.setItem('step', step);
        localStorage.setItem('userData', JSON.stringify(userData));
    }
}

function editMessage(messageElement, stepIndex) {
    const input = document.getElementById('userInput');
    input.value = messageElement.textContent.replace('✎', '').trim();
    messageElement.remove();
    messageHistory = messageHistory.slice(0, stepIndex);
    step = stepIndex;
    clearFutureMessages(stepIndex);
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
    localStorage.setItem('step', step);
    input.focus();
}

function clearFutureMessages(stepIndex) {
    const chatbox = document.getElementById('chatbox');
    const messages = Array.from(chatbox.children);
    const index = messages.findIndex(p => p.textContent === messageHistory[stepIndex].message && p.className === 'user');
    if (index !== -1) {
        for (let i = messages.length - 1; i > index; i--) {
            chatbox.removeChild(messages[i]);
        }
    }
    clearQuickReplies();
    suggestionActive = false;
    suggestionStep = 0;
    lastSuggestion = null;
}

function addTypingIndicator() {
    const chatbox = document.getElementById('chatbox');
    const existingTyping = chatbox.querySelector('.typing');
    if (!existingTyping) {
        addMessage("ReMida sta scrivendo...", 'typing');
        console.log("Typing indicator added.");
    }
}

function removeTypingIndicator() {
    const chatbox = document.getElementById('chatbox');
    const typing = chatbox.querySelector('.typing');
    if (typing) typing.remove();
    console.log("Typing indicator removed.");
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

// Funzione per aggiornare la barra di progresso
function updateProgressBar(step) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressContainer = document.getElementById('progressBarContainer');
    
    if (step <= totalSteps) {
        progressContainer.classList.remove('hidden');
        const percentage = (step / totalSteps) * 100;
        progressBar.style.setProperty('--progress-width', `${percentage}%`);
        progressText.textContent = `Passaggio ${step} di ${totalSteps}`;
    } else {
        progressContainer.classList.add('hidden');
    }
}

// Aggiungere regola CSS dinamica per la barra di progresso
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .progress-bar::after {
        width: var(--progress-width, 0%);
    }
`;
document.head.appendChild(styleSheet);

// Funzione per mostrare il tutorial iniziale
function showTutorialModal() {
    const modal = document.createElement('div');
    modal.id = 'tutorialModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Benvenuto in ReMida AI!</h2>
            <p>Sono qui per aiutarti a gestire il tuo patrimonio. Ti guiderò passo passo:</p>
            <p>1. Rispondi alle mie domande sui tuoi soldi.<br>
               2. Guarda i grafici e i consigli personalizzati.<br>
               3. Usa il menu (☰) per simulazioni e altro!</p>
            <button onclick="startChat(); document.getElementById('tutorialModal').remove()">Inizia Ora</button>
            <button onclick="document.getElementById('tutorialModal').remove()">Salta</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Funzione per iniziare la chat
function startChat() {
    addMessage("Ciao! Sono ReMida AI, il tuo consulente finanziario personale. Vuoi dare un’occhiata al tuo patrimonio? Dimmi 'Sì' quando sei pronto!", 'bot');
    addQuickReplies(['Sì', 'No']);
    updateProgressBar(step);
}

function showGlossaryModal() {
    const modal = document.createElement('div');
    modal.id = 'glossaryModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Glossario Finanziario</h2>
            <ul>
                ${Object.entries(glossary).map(([term, desc]) => `<li><strong>${term.toUpperCase()}:</strong> ${desc}</li>`).join('')}
            </ul>
            <button onclick="document.getElementById('glossaryModal').remove()">Chiudi</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function showCalculatorModal() {
    const modal = document.createElement('div');
    modal.id = 'calculatorModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Simulatore PAC</h2>
            <label>Importo Iniziale (€):</label><input type="number" id="initialAmount" value="5000"><br>
            <label>Tasso di Rendimento (% annuo):</label><input type="number" id="rate" value="5" step="0.1"><br>
            <label>Contributo Mensile (€):</label><input type="number" id="monthly" value="200"><br>
            <label>Anni:</label><input type="number" id="years" value="10"><br>
            <button onclick="calculateInvestment()">Calcola</button>
            <button onclick="document.getElementById('calculatorModal').remove()">Chiudi</button>
            <canvas id="calculatorChart" width="400" height="200"></canvas>
            <p id="calculatorResult"></p>
        </div>
    `;
    document.body.appendChild(modal);
}

function calculateInvestment() {
    const initial = parseFloat(document.getElementById('initialAmount').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) / 100 || 0;
    const monthly = parseFloat(document.getElementById('monthly').value) || 0;
    const years = parseInt(document.getElementById('years').value) || 0;

    const data = [];
    let total = initial;
    for (let i = 0; i <= years; i++) {
        if (i > 0) {
            total = total * (1 + rate) + monthly * 12;
        }
        data.push(total);
    }

    if (calculatorChart) calculatorChart.destroy();
    calculatorChart = new Chart(document.getElementById('calculatorChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({ length: years + 1 }, (_, i) => `Anno ${i}`),
            datasets: [{
                label: 'Crescita Investimento',
                data: data,
                borderColor: '#2196f3',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: 'Proiezione Investimento' },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString('it-IT')}€` } }
            }
        }
    });

    document.getElementById('calculatorResult').innerHTML = `Totale dopo ${years} anni: <strong>${data[years].toLocaleString('it-IT')}€</strong>`;
}

function getChartColors() {
    const isDark = document.body.classList.contains('dark');
    return {
        safety: [isDark ? '#55e7a0' : '#2ecc71', isDark ? '#ff6b6b' : '#e74c3c'],
        inflation: isDark ? '#ffcc80' : '#ff9800',
        liquidity: [isDark ? '#81c784' : '#4caf50', isDark ? '#ff8787' : '#f44336'],
        asset: [isDark ? '#64b5f6' : '#2196f3', isDark ? '#ba68c8' : '#9c27b0', isDark ? '#fff176' : '#ffeb3b'],
        etf: isDark ? '#64b5f6' : '#2196f3',
        pac: isDark ? '#81c784' : '#4caf50',
        summary: isDark ? '#42a5f5' : '#1e88e5'
    };
}

function drawCharts(safetyIndex, inflazione, illiquidita, total) {
    if (chartsDrawn) return;
    const colors = getChartColors();

    const summaryGrowth = [
        total,
        total + (userData.risparmioMensile * 12 * 0.05) - inflazione,
        total + (userData.risparmioMensile * 24 * 1.05) - (inflazione * 2),
        total + (userData.risparmioMensile * 36 * 1.05 ** 2) - (inflazione * 3)
    ];
    charts.summary = new Chart(document.getElementById('summaryChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Oggi', '1 anno', '2 anni', '3 anni'],
            datasets: [{
                label: 'Patrimonio Totale',
                data: summaryGrowth,
                borderColor: colors.summary,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            animation: { duration: 2000, easing: 'easeInOutQuart' },
            plugins: {
                title: { display: true, text: 'Proiezione Patrimonio Totale' },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString('it-IT')}€` } }
            }
        }
    });
    document.getElementById('summaryText').innerHTML = `
        Questo grafico ti mostra come potrebbe crescere il tuo patrimonio totale di <strong>${total.toLocaleString('it-IT')}€</strong> nei prossimi 3 anni, 
        considerando il tuo risparmio mensile di <strong>${userData.risparmioMensile.toLocaleString('it-IT')}€</strong> investito al 5% annuo e la perdita da inflazione 
        di <strong>${inflazione.toFixed(0)}€</strong> all’anno. Dopo 1 anno potresti avere <strong>${summaryGrowth[1].toFixed(0)}€</strong>, 
        dopo 2 anni <strong>${summaryGrowth[2].toFixed(0)}€</strong> e dopo 3 anni <strong>${summaryGrowth[3].toFixed(0)}€</strong>. 
        È una previsione per capire come i tuoi soldi possono lavorare per te!
    `;

    charts.safety = new Chart(document.getElementById('safetyChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Sicurezza', 'Rischio'], datasets: [{ data: [safetyIndex, 100 - safetyIndex], backgroundColor: colors.safety }] },
        options: {
            animation: { animateScale: true, animateRotate: true, duration: 1500 },
            plugins: {
                legend: { display: false },
                title: { display: true, text: `Sicurezza: ${safetyIndex}%` },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}%` } }
            }
        }
    });
    document.getElementById('safetyText').innerHTML = `
        Questo grafico ti mostra quanto è sicuro il tuo patrimonio oggi. Il tuo indice di sicurezza è <strong>${safetyIndex}%</strong>. 
        Il verde rappresenta la parte dei tuoi soldi che è ben protetta da rischi come l’inflazione o perdite improvvise. 
        Il rosso, invece, è il <strong>${100 - safetyIndex}%</strong> che potrebbe essere a rischio, ad esempio perché troppo fermo o poco diversificato. 
        Più il verde cresce, più sei tranquillo per il futuro!
    `;

    charts.inflation = new Chart(document.getElementById('inflationChart').getContext('2d'), {
        type: 'bar',
        data: { labels: ['Perdita Annuale'], datasets: [{ label: 'Inflazione', data: [inflazione], backgroundColor: colors.inflation }] },
        options: {
            animation: { duration: 2000, easing: 'easeOutBounce' },
            scales: { y: { beginAtZero: true } },
            plugins: {
                title: { display: true, text: 'Perdita per Inflazione (€)' },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString('it-IT')}€ persi all’anno` } }
            }
        }
    });
    document.getElementById('inflationText').innerHTML = `
        Qui vedi quanto valore perdi ogni anno tenendo <strong>${userData.contoCorrente.toLocaleString('it-IT')}€</strong> sul conto corrente. 
        Con l’inflazione, che è l’aumento dei prezzi nel tempo, perdi <strong>${inflazione.toFixed(0)}€</strong> all’anno. 
        È come se il tuo denaro "si sciogliesse" un po’ alla volta: lasciando i soldi fermi, compri meno cose domani rispetto a oggi. 
        Muoverli in un investimento può fermare questa perdita!
    `;

    charts.liquidity = new Chart(document.getElementById('liquidityChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['Liquido', 'Illiquido'], datasets: [{ data: [100 - illiquidita, illiquidita], backgroundColor: colors.liquidity }] },
        options: {
            animation: { animateScale: true, animateRotate: true, duration: 1500 },
            plugins: {
                title: { display: true, text: `Illiquidità: ${illiquidita.toFixed(0)}%` },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw.toFixed(0)}% (${((context.raw / 100) * total).toLocaleString('it-IT')}€)` } }
            }
        }
    });
    document.getElementById('liquidityText').innerHTML = `
        Questo grafico divide i tuoi soldi in due parti. Il rosso (<strong>${illiquidita.toFixed(0)}%</strong>) mostra quanto del tuo patrimonio, 
        come i <strong>${userData.immobili.toLocaleString('it-IT')}€</strong> in immobili, è "bloccato" e non puoi usarlo subito. 
        Il verde (<strong>${(100 - illiquidita).toFixed(0)}%</strong>) è invece quello liquido, come i <strong>${userData.contoCorrente.toLocaleString('it-IT')}€</strong> 
        sul conto, che puoi spendere o investire quando vuoi. Troppo rosso significa meno flessibilità!
    `;

    charts.asset = new Chart(document.getElementById('assetChart').getContext('2d'), {
        type: 'pie',
        data: { 
            labels: ['Conto Corrente', 'Immobili', 'Obbligazioni'], 
            datasets: [{ data: [userData.contoCorrente, userData.immobili, userData.obbligazioni || 0], backgroundColor: colors.asset }] 
        },
        options: {
            animation: { animateScale: true, animateRotate: true, duration: 1500 },
            plugins: {
                title: { display: true, text: 'Distribuzione Patrimonio' },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw.toLocaleString('it-IT')}€` } }
            }
        }
    });
    document.getElementById('assetText').innerHTML = `
        Questo è il "mappamondo" dei tuoi soldi! Hai <strong>${userData.contoCorrente.toLocaleString('it-IT')}€</strong> sul conto corrente (blu), 
        <strong>${userData.immobili.toLocaleString('it-IT')}€</strong> in immobili (viola) e <strong>${(userData.obbligazioni || 0).toLocaleString('it-IT')}€</strong> 
        in obbligazioni (giallo). Ti mostra come è distribuito il tuo patrimonio totale di <strong>${total.toLocaleString('it-IT')}€</strong>. 
        Se un colore è troppo grande, potresti voler bilanciare meglio i tuoi investimenti!
    `;

    const etfAmount = userData.contoCorrente * 0.2;
    const etfGrowth = [etfAmount, etfAmount * 1.02, etfAmount * 1.02 ** 2, etfAmount * 1.02 ** 3];
    charts.etf = new Chart(document.getElementById('etfGrowthChart').getContext('2d'), {
        type: 'line',
        data: { 
            labels: ['Oggi', '1 anno', '2 anni', '3 anni'], 
            datasets: [{ label: 'ETF', data: etfGrowth, borderColor: colors.etf, fill: false, tension: 0.4 }] 
        },
        options: {
            animation: { duration: 2000, easing: 'easeInOutQuart' },
            plugins: {
                title: { display: true, text: 'Crescita ETF (2% annuo)' },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString('it-IT')}€` } }
            }
        }
    });
    document.getElementById('etfGrowthText').innerHTML = `
        Immagina di prendere <strong>${etfAmount.toFixed(0)}€</strong> dal tuo conto e metterli in un ETF, un tipo di investimento sicuro che cresce del 2% all’anno. 
        Questo grafico ti mostra come quei soldi possono aumentare: dopo 1 anno diventano <strong>${etfGrowth[1].toFixed(0)}€</strong>, 
        dopo 2 anni <strong>${etfGrowth[2].toFixed(0)}€</strong> e dopo 3 anni <strong>${etfGrowth[3].toFixed(0)}€</strong>. 
        È un modo semplice per battere l’inflazione e far crescere il tuo patrimonio nel tempo!
    `;

    const pacMonthly = userData.risparmioMensile * 0.6;
    const pacGrowth = [0, pacMonthly * 12 * 1.05, pacMonthly * 24 * 1.05 ** 2, pacMonthly * 36 * 1.05 ** 3];
    charts.pac = new Chart(document.getElementById('pacGrowthChart').getContext('2d'), {
        type: 'line',
        data: { 
            labels: ['Oggi', '1 anno', '2 anni', '3 anni'], 
            datasets: [{ label: 'PAC', data: pacGrowth, borderColor: colors.pac, fill: false, tension: 0.4 }] 
        },
        options: {
            animation: { duration: 2000, easing: 'easeInOutQuart' },
            plugins: {
                title: { display: true, text: 'Crescita PAC (5% annuo)' },
                tooltip: { callbacks: { label: (context) => `${context.raw.toLocaleString('it-IT')}€` } }
            }
        }
    });
    document.getElementById('pacGrowthText').innerHTML = `
        Se metti da parte <strong>${pacMonthly.toFixed(0)}€ al mese</strong> (il 60% del tuo risparmio mensile di <strong>${userData.risparmioMensile.toLocaleString('it-IT')}€</strong>) 
        in un PAC che cresce del 5% all’anno, questo grafico ti mostra il risultato. Dopo 1 anno hai <strong>${pacGrowth[1].toFixed(0)}€</strong>, 
        dopo 2 anni <strong>${pacGrowth[2].toFixed(0)}€</strong> e dopo 3 anni <strong>${pacGrowth[3].toFixed(0)}€</strong>. 
        È un piano di accumulo: risparmi un po’ ogni mese e lo fai crescere per il tuo futuro!
    `;

    chartsDrawn = true;
    document.getElementById('themeToggle').addEventListener('change', updateChartColors);
}

function updateChartColors() {
    const colors = getChartColors();
    if (charts.summary) charts.summary.data.datasets[0].borderColor = colors.summary;
    if (charts.safety) charts.safety.data.datasets[0].backgroundColor = colors.safety;
    if (charts.inflation) charts.inflation.data.datasets[0].backgroundColor = colors.inflation;
    if (charts.liquidity) charts.liquidity.data.datasets[0].backgroundColor = colors.liquidity;
    if (charts.asset) charts.asset.data.datasets[0].backgroundColor = colors.asset;
    if (charts.etf) charts.etf.data.datasets[0].borderColor = colors.etf;
    if (charts.pac) charts.pac.data.datasets[0].borderColor = colors.pac;
    Object.values(charts).forEach(chart => chart.update());
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yOffset = margin;

    doc.setFontSize(18);
    doc.text("Report Finanziario - ReMida AI", pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 15;

    const analysisText = document.querySelector('#chatbox p.bot:last-child').innerText;
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(analysisText, pageWidth - 2 * margin);
    doc.text(splitText, margin, yOffset);
    yOffset += splitText.length * 7 + 10;

    const chartIds = ['summaryChart', 'safetyChart', 'inflationChart', 'liquidityChart', 'assetChart', 'etfGrowthChart', 'pacGrowthChart'];
    chartIds.forEach((id, index) => {
        const canvas = document.getElementById(id);
        if (yOffset > 250) {
            doc.addPage();
            yOffset = margin;
        }
        html2canvas(canvas).then(canvasImg => {
            const imgData = canvasImg.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 10;

            const chartText = document.getElementById(`${id.replace('Chart', 'Text')}`).innerText;
            const splitChartText = doc.splitTextToSize(chartText, pageWidth - 2 * margin);
            doc.text(splitChartText, margin, yOffset);
            yOffset += splitChartText.length * 7 + 10;

            if (index === chartIds.length - 1) {
                doc.save('ReMida_Report.pdf');
            }
        });
    });
}

function getPersonalizedAdvice(total, inflazione, illiquidita, safetyIndex) {
    let advice = `
Ecco come stanno i tuoi soldi: hai <strong>${total.toLocaleString('it-IT')}€</strong> totali.

- <strong>Inflazione</strong>: perdi <strong>${inflazione.toFixed(0)}€ all’anno</strong> sul conto corrente.
- <strong>Illiquidità</strong>: il <strong>${illiquidita.toFixed(0)}%</strong> del tuo patrimonio è fermo.
- <strong>Indice di Sicurezza</strong>: <strong>${safetyIndex}%</strong>.

<strong>Cosa puoi fare?</strong>
`;
    if (userData.eta < 30) {
        advice += `- Alla tua età (${userData.eta} anni), hai tempo per rischiare un po’: investi <strong>${(userData.contoCorrente * 0.3).toFixed(0)}€</strong> in un ETF azionario globale (+5-7% annuo).\n`;
    } else if (userData.eta < 50) {
        advice += `- Con ${userData.eta} anni, bilancia rischio e sicurezza: sposta <strong>${(userData.contoCorrente * 0.2).toFixed(0)}€</strong> in un ETF obbligazionario (+2% annuo).\n`;
    } else {
        advice += `- A ${userData.eta} anni, punta sulla stabilità: metti <strong>${(userData.contoCorrente * 0.15).toFixed(0)}€</strong> in titoli di Stato o fondi a basso rischio.\n`;
    }

    if (userData.obiettivo.toLowerCase().includes('pensione')) {
        advice += `- Per la pensione, avvia un PAC con <strong>${(userData.risparmioMensile * 0.6).toFixed(0)}€ al mese</strong> su un fondo bilanciato.\n`;
    } else if (userData.obiettivo.toLowerCase().includes('casa')) {
        advice += `- Per comprare casa, risparmia <strong>${(userData.redditoAnnuo * 0.2 / 12).toFixed(0)}€ al mese</strong> e considera un fondo immobiliare.\n`;
    } else if (userData.obiettivo.toLowerCase().includes('viaggi')) {
        advice += `- Per i viaggi, investi <strong>${(userData.contoCorrente * 0.1).toFixed(0)}€</strong> in un ETF flessibile per avere liquidità tra ${userData.orizzonteTemporale} anni.\n`;
    } else {
        advice += `- Per il tuo obiettivo "${userData.obiettivo}", punta su un fondo diversificato con <strong>${(userData.risparmioMensile * 0.5).toFixed(0)}€ al mese</strong>.\n`;
    }

    advice += `
- Il tuo patrimonio è troppo fermo? Considera di affittare o vendere una parte degli immobili.
- Con il tuo orizzonte di <strong>${userData.orizzonteTemporale} anni</strong>, mix sicurezza e crescita con fondi misti.

Ti va di approfondire? Dimmi "Sì"!
    `;
    return advice;
}

function addSuggestion(total) {
    if (userData.immobili / total > 0.7) {
        setTimeout(() => {
            lastSuggestion = "Hai molti immobili rispetto al totale. Vuoi consigli su come renderli più liquidi?";
            addMessage(lastSuggestion, 'bot');
            addQuickReplies(['Sì', 'No']);
            suggestionActive = true;
            suggestionStep = 1;
        }, 2000);
    } else if (userData.contoCorrente / total > 0.5) {
        setTimeout(() => {
            lastSuggestion = "Tieni troppi soldi sul conto corrente. Vuoi idee per farli crescere?";
            addMessage(lastSuggestion, 'bot');
            addQuickReplies(['Sì', 'No']);
            suggestionActive = true;
            suggestionStep = 1;
        }, 2000);
    } else if (userData.risparmioMensile < userData.redditoAnnuo * 0.05) {
        setTimeout(() => {
            lastSuggestion = "Risparmi poco rispetto al tuo reddito. Vuoi un piano per aumentare il risparmio?";
            addMessage(lastSuggestion, 'bot');
            addQuickReplies(['Sì', 'No']);
            suggestionActive = true;
            suggestionStep = 1;
        }, 2000);
    }
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

    setTimeout(() => {
        removeTypingIndicator();
        drawCharts(safetyIndex, inflazione, illiquidita, total);
        const reply = getPersonalizedAdvice(total, inflazione, illiquidita, safetyIndex);
        addMessage(reply, 'bot');
        addQuickReplies(['Sì', 'No']);
        addSuggestion(total);
        document.getElementById('exportPDFBtn').classList.remove('hidden');
    }, 1500);
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user', step);
    input.value = '';
    clearQuickReplies();

    if (suggestionActive) {
        addTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            if (suggestionStep === 1) {
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    if (lastSuggestion.includes("renderli più liquidi")) {
                        addMessage("Puoi affittare una proprietà per avere entrate regolari o venderne una parte per reinvestire in ETF o fondi. Ad esempio, affittando per 500€ al mese guadagni 6000€ l’anno, oppure vendendo il 20% degli immobili (circa " + ((userData.immobili * 0.2).toLocaleString('it-IT')) + "€) puoi investirli al 5% annuo. Vuoi dettagli?", 'bot');
                        addQuickReplies(['Sì', 'No']);
                        suggestionStep = 2;
                    } else if (lastSuggestion.includes("farli crescere")) {
                        addMessage("Prova un ETF azionario globale (+5-7% annuo) o un PAC diversificato. Ad esempio, con " + ((userData.contoCorrente * 0.2).toLocaleString('it-IT')) + "€ in un ETF al 6% annuo, guadagni circa " + ((userData.contoCorrente * 0.2 * 0.06).toLocaleString('it-IT')) + "€ il primo anno. Vuoi dettagli?", 'bot');
                        addQuickReplies(['Sì', 'No']);
                        suggestionStep = 2;
                    } else if (lastSuggestion.includes("aumentare il risparmio")) {
                        addMessage("Riduci le spese non essenziali di un 10% (circa " + ((userData.redditoAnnuo * 0.1 / 12).toFixed(0)) + "€ al mese) e metti la differenza in un PAC. Ad esempio, con " + ((userData.redditoAnnuo * 0.1 / 12).toFixed(0)) + "€ al mese al 5% annuo, in 5 anni hai circa " + ((userData.redditoAnnuo * 0.1 / 12 * 60 * 1.05 ** 5).toFixed(0)) + "€. Vuoi dettagli?", 'bot');
                        addQuickReplies(['Sì', 'No']);
                        suggestionStep = 2;
                    }
                } else {
                    addMessage("Ok, torniamo all’analisi principale. Vuoi approfondire altro sul tuo patrimonio?", 'bot');
                    addQuickReplies(['Sì', 'No']);
                    suggestionActive = false;
                    suggestionStep = 0;
                    lastSuggestion = null;
                }
            } else if (suggestionStep === 2) {
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    if (lastSuggestion.includes("renderli più liquidi")) {
                        addMessage("Ecco un esempio: vendendo " + ((userData.immobili * 0.2).toLocaleString('it-IT')) + "€ di immobili e investendo in un ETF al 5% annuo, in 3 anni ottieni circa " + ((userData.immobili * 0.2 * 1.05 ** 3).toLocaleString('it-IT')) + "€. Oppure, affittando a 500€/mese, in 3 anni sono " + (500 * 36).toLocaleString('it-IT') + "€. Altro da approfondire?", 'bot');
                    } else if (lastSuggestion.includes("farli crescere")) {
                        addMessage("Con " + ((userData.contoCorrente * 0.2).toLocaleString('it-IT')) + "€ in un ETF al 6% annuo, in 3 anni arrivi a circa " + ((userData.contoCorrente * 0.2 * 1.06 ** 3).toLocaleString('it-IT')) + "€. O con un PAC da 200€/mese al 5%, in 3 anni sono " + ((200 * 36 * 1.05 ** 3).toLocaleString('it-IT')) + "€. Altro da approfondire?", 'bot');
                    } else if (lastSuggestion.includes("aumentare il risparmio")) {
                        addMessage("Risparmiando " + ((userData.redditoAnnuo * 0.1 / 12).toFixed(0)) + "€ al mese in un PAC al 5%, in 5 anni accumuli circa " + ((userData.redditoAnnuo * 0.1 / 12 * 60 * 1.05 ** 5).toFixed(0)) + "€. Altro da approfondire?", 'bot');
                    }
                    addQuickReplies(['Sì', 'No']);
                    suggestionActive = false;
                    suggestionStep = 0;
                    lastSuggestion = null;
                } else {
                    addMessage("Ok, torniamo all’analisi principale. Vuoi approfondire altro sul tuo patrimonio?", 'bot');
                    addQuickReplies(['Sì', 'No']);
                    suggestionActive = false;
                    suggestionStep = 0;
                    lastSuggestion = null;
                }
            }
        }, 1500);
        return;
    }

    switch (step) {
        case 0: // Inizio
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    addMessage("Fantastico! Partiamo dalle basi: quanti soldi hai sul conto corrente?", 'bot');
                    step = 1;
                    updateProgressBar(step);
                } else if (message.toLowerCase() === 'continuare' && localStorage.getItem('step')) {
                    step = parseInt(localStorage.getItem('step'));
                    addMessage("Ok, riprendiamo da dove eri! Come posso aiutarti ora?", 'bot');
                    addQuickReplies(['Approfondire', 'Ripartire']);
                    updateProgressBar(step);
                } else if (message.toLowerCase() === 'ripartire') {
                    localStorage.clear();
                    userData = { contoCorrente: null, immobili: null, obbligazioni: null, risparmioMensile: null, eta: null, redditoAnnuo: null, orizzonteTemporale: null, obiettivo: null };
                    step = 1;
                    messageHistory = [];
                    chartsDrawn = false;
                    addMessage("Ok, ripartiamo! Quanti soldi hai sul conto corrente?", 'bot');
                    updateProgressBar(step);
                } else {
                    addMessage("Nessun problema, quando vuoi dire 'Sì' sono qui!", 'bot');
                    addQuickReplies(['Sì', 'No']);
                }
            }, 1000);
            break;

        case 1: // Conto corrente
            userData.contoCorrente = parseFloat(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.contoCorrente) || userData.contoCorrente < 0) {
                    addMessage("Mi serve un numero valido, puoi riprovare?", 'bot');
                } else {
                    addMessage("Ok, perfetto! E quanto valgono i tuoi immobili, se ne hai?", 'bot');
                    step = 2;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 2: // Immobili
            userData.immobili = parseFloat(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.immobili) || userData.immobili < 0) {
                    addMessage("Inserisci un numero valido, per favore!", 'bot');
                } else {
                    addMessage("Hai obbligazioni o altri investimenti? Quanto valgono? (Scrivi 0 se non ne hai)", 'bot');
                    step = 3;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 3: // Obbligazioni
            userData.obbligazioni = parseFloat(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.obbligazioni) || userData.obbligazioni < 0) {
                    addMessage("Ci vuole un numero valido, riprova!", 'bot');
                } else {
                    addMessage("Quanto riesci a mettere da parte ogni mese? Il tuo risparmio mensile?", 'bot');
                    step = 4;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 4: // Risparmio mensile
            userData.risparmioMensile = parseFloat(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.risparmioMensile) || userData.risparmioMensile < 0) {
                    addMessage("Dammi un numero valido, dai!", 'bot');
                } else {
                    addMessage("Quanti anni hai? Mi aiuta a capire meglio la tua situazione.", 'bot');
                    step = 5;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 5: // Età
            userData.eta = parseInt(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.eta) || userData.eta < 18 || userData.eta > 120) {
                    addMessage("Inserisci un’età realistica, per favore!", 'bot');
                } else {
                    addMessage("Qual è il tuo reddito annuo netto? (Es. 30000)", 'bot');
                    step = 6;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 6: // Reddito annuo
            userData.redditoAnnuo = parseFloat(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.redditoAnnuo) || userData.redditoAnnuo < 0) {
                    addMessage("Serve un numero valido per il reddito, riprova!", 'bot');
                } else {
                    addMessage("Per quanti anni vuoi pianificare il tuo futuro finanziario? (Es. 10, 20)", 'bot');
                    step = 7;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 7: // Orizzonte temporale
            userData.orizzonteTemporale = parseInt(message);
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (isNaN(userData.orizzonteTemporale) || userData.orizzonteTemporale < 1) {
                    addMessage("Inserisci un numero di anni valido, ok?", 'bot');
                } else {
                    addMessage("Ultimo passo: qual è il tuo obiettivo principale? (Es. pensione, casa, viaggi)", 'bot');
                    addQuickReplies(['Pensione', 'Casa', 'Viaggi', 'Altro']);
                    step = 8;
                    updateProgressBar(step);
                }
            }, 1000);
            break;

        case 8: // Obiettivo
            userData.obiettivo = message;
            addTypingIndicator();
            step = 9;
            updateProgressBar(step);
            analyzeData();
            break;

        case 9: // Dopo analisi
            addTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                if (message.toLowerCase().startsWith('sì') || message.toLowerCase().startsWith('si')) {
                    let extraReply = `Ok, approfondiamo per il tuo obiettivo "${userData.obiettivo}":\n`;
                    if (userData.obiettivo.toLowerCase().includes('pensione')) {
                        extraReply += `- Con ${userData.orizzonteTemporale} anni davanti, potresti mettere ${(userData.redditoAnnuo * 0.15 / 12).toFixed(0)}€ al mese in un fondo pensione.\n`;
                    } else if (userData.obiettivo.toLowerCase().includes('casa')) {
                        extraReply += `- Risparmia almeno ${(userData.redditoAnnuo * 0.2 / 12).toFixed(0)}€ al mese per un anticipo in ${userData.orizzonteTemporale} anni.\n`;
                    } else {
                        extraReply += `- Punta su investimenti flessibili, come un fondo bilanciato, per il tuo obiettivo.\n`;
                    }
                    extraReply += `- Una polizza vita o un’assicurazione sul patrimonio potrebbe darti più tranquillità.\n\nVuoi rifare tutto con dati diversi? Dimmi "Sì"!`;
                    addMessage(extraReply, 'bot');
                    addQuickReplies(['Sì', 'No']);
                } else if (message.toLowerCase().startsWith('no')) {
                    addMessage("Grazie per avermi usato! Se vuoi ripartire, dimmi 'Sì'.", 'bot');
                    addQuickReplies(['Sì', 'No']);
                    step = 0;
                    chartsDrawn = false;
                    updateProgressBar(step);
                }
            }, 1500);
            break;
    }
}

// Carica dati salvati
function loadSavedData() {
    const savedStep = localStorage.getItem('step');
    const savedHistory = localStorage.getItem('messageHistory');
    const savedUserData = localStorage.getItem('userData');

    if (savedStep) step = parseInt(savedStep);
    if (savedHistory) {
        messageHistory = JSON.parse(savedHistory);
        messageHistory.forEach(msg => {
            addMessage(msg.message, msg.sender);
        });
    }
    if (savedUserData) userData = JSON.parse(savedUserData);

    if (step > 8 && !chartsDrawn) {
        const total = userData.contoCorrente + userData.immobili + (userData.obbligazioni || 0);
        const inflazione = userData.contoCorrente * 0.02;
        const illiquidita = (userData.immobili / total) * 100;
        let safetyIndex = 100;
        if (inflazione > 1000) safetyIndex -= 10;
        if (illiquidita > 50) safetyIndex -= 20;
        if (userData.obbligazioni && (userData.obbligazioni * 0.01 - userData.obbligazioni * 0.02) < 0) safetyIndex -= 10;
        if (userData.risparmioMensile < userData.redditoAnnuo * 0.05) safetyIndex -= 5;
        if (userData.eta > 50 && illiquidita > 70) safetyIndex -= 10;
        drawCharts(safetyIndex, inflazione, illiquidita, total);
        document.getElementById('exportPDFBtn').classList.remove('hidden');
    }
    updateProgressBar(step);
}

// Funzione per mostrare il modale della simulazione scenari
function showSimulationModal() {
    const total = userData.contoCorrente + userData.immobili + (userData.obbligazioni || 0);
    if (!total) {
        alert("Inserisci prima i tuoi dati finanziari per simulare scenari!");
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'simulationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Simulazione Scenari</h2>
            <label>Seleziona gli Scenari da Confrontare (tieni premuto Ctrl/Cmd per più scelte):</label>
            <select id="scenarioSelect" multiple>
                <option value="base">Base (Infl. 2%, Rend. 5%)</option>
                <option value="highInflation">Inflazione Alta (Infl. 5%, Rend. 5%, Tasse 1%)</option>
                <option value="marketBoom">Mercato in Crescita (Infl. 2%, Rend. 8%, Volatilità Alta)</option>
                <option value="crisis">Crisi Economica (Infl. 3%, Rend. 2%, Perdita 10% Anno 1)</option>
                <option value="custom">Personalizzato</option>
            </select>
            <div id="customInputs" class="scenario-inputs" style="display: none;">
                <label>Inflazione (%):</label><input type="number" id="customInflation" value="2" step="0.1" min="0" max="10">
                <label>Rendimento Annuo (%):</label><input type="number" id="customReturn" value="5" step="0.1" min="0" max="15">
                <label>Tasse Annuali (%):</label><input type="number" id="customTax" value="0" step="0.1" min="0" max="5">
                <label>Volatilità (%):</label><input type="number" id="customVolatility" value="0" step="0.1" min="0" max="20">
                <label>Contributo Mensile (€):</label><input type="number" id="customMonthly" value="${userData.risparmioMensile || 0}">
                <label>Anni:</label><input type="number" id="customYears" value="${userData.orizzonteTemporale || 10}" min="1">
            </div>
            <button onclick="runSimulation()">Simula e Confronta</button>
            <button onclick="document.getElementById('simulationModal').remove()">Chiudi</button>
            <canvas id="simulationChart" width="500" height="300"></canvas>
            <p id="simulationResult"></p>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('scenarioSelect').addEventListener('change', function() {
        const customSelected = Array.from(this.selectedOptions).some(opt => opt.value === 'custom');
        document.getElementById('customInputs').style.display = customSelected ? 'block' : 'none';
    });
}

function runSimulation() {
    const selectedScenarios = Array.from(document.getElementById('scenarioSelect').selectedOptions).map(opt => opt.value);
    const total = userData.contoCorrente + userData.immobili + (userData.obbligazioni || 0);
    const datasets = [];
    let resultText = "Confronto degli scenari:\n";

    selectedScenarios.forEach(scenario => {
        let inflationRate, returnRate, taxRate, volatility, monthlyContribution, years, lossFirstYear;

        switch (scenario) {
            case 'base':
                inflationRate = 0.02;
                returnRate = 0.05;
                taxRate = 0;
                volatility = 0;
                monthlyContribution = userData.risparmioMensile || 0;
                years = userData.orizzonteTemporale || 10;
                lossFirstYear = 0;
                break;
            case 'highInflation':
                inflationRate = 0.05;
                returnRate = 0.05;
                taxRate = 0.01;
                volatility = 0;
                monthlyContribution = userData.risparmioMensile || 0;
                years = userData.orizzonteTemporale || 10;
                lossFirstYear = 0;
                break;
            case 'marketBoom':
                inflationRate = 0.02;
                returnRate = 0.08;
                taxRate = 0;
                volatility = 0.15;
                monthlyContribution = userData.risparmioMensile || 0;
                years = userData.orizzonteTemporale || 10;
                lossFirstYear = 0;
                break;
            case 'crisis':
                inflationRate = 0.03;
                returnRate = 0.02;
                taxRate = 0;
                volatility = 0;
                monthlyContribution = userData.risparmioMensile || 0;
                years = userData.orizzonteTemporale || 10;
                lossFirstYear = 0.10;
                break;
            case 'custom':
                inflationRate = (parseFloat(document.getElementById('customInflation').value) || 2) / 100;
                returnRate = (parseFloat(document.getElementById('customReturn').value) || 5) / 100;
                taxRate = (parseFloat(document.getElementById('customTax').value) || 0) / 100;
                volatility = (parseFloat(document.getElementById('customVolatility').value) || 0) / 100;
                monthlyContribution = parseFloat(document.getElementById('customMonthly').value) || 0;
                years = parseInt(document.getElementById('customYears').value) || 10;
                lossFirstYear = 0;
                break;
        }

        const data = [];
        let currentValue = total;
        for (let i = 0; i <= years; i++) {
            if (i === 1 && lossFirstYear > 0) {
                currentValue *= (1 - lossFirstYear);
            } else if (i > 0) {
                const volatileReturn = returnRate + (volatility * (Math.random() - 0.5) * 2);
                currentValue = currentValue * (1 + volatileReturn - inflationRate - taxRate) + monthlyContribution * 12;
            }
            data.push(Math.max(0, currentValue));
        }

        datasets.push({
            label: scenario === 'custom' ? 'Personalizzato' : scenario,
            data: data,
            borderColor: getScenarioColor(scenario),
            fill: false,
            tension: 0.4
        });

        resultText += `\n- <strong>${scenario === 'custom' ? 'Personalizzato' : scenario}</strong>:\n`;
        resultText += `  Inflazione: ${(inflationRate * 100).toFixed(1)}%, Rendimento: ${(returnRate * 100).toFixed(1)}%, `;
        if (taxRate > 0) resultText += `Tasse: ${(taxRate * 100).toFixed(1)}%, `;
        if (volatility > 0) resultText += `Volatilità: ${(volatility * 100).toFixed(1)}%, `;
        if (lossFirstYear > 0) resultText += `Perdita Anno 1: ${(lossFirstYear * 100).toFixed(1)}%, `;
        resultText += `Contributo: ${monthlyContribution.toLocaleString('it-IT')}€/mese, `;
        resultText += `Dopo ${years} anni: <strong>${data[years].toLocaleString('it-IT')}€</strong>.\n`;
    });

    if (simulationChart) simulationChart.destroy();
    simulationChart = new Chart(document.getElementById('simulationChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({ length: (userData.orizzonteTemporale || 10) + 1 }, (_, i) => `Anno ${i}`),
            datasets: datasets
        },
        options: {
            plugins: {
                title: { display: true, text: 'Confronto Scenari' },
                tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString('it-IT')}€` } },
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });

    document.getElementById('simulationResult').innerHTML = resultText;
}

function getScenarioColor(scenario) {
    switch (scenario) {
        case 'base': return '#2196f3';
        case 'highInflation': return '#ff9800';
        case 'marketBoom': return '#4caf50';
        case 'crisis': return '#e74c3c';
        case 'custom': return '#9c27b0';
        default: return '#666';
    }
}

// Tema Dark Switch
document.getElementById('themeToggle').addEventListener('change', function() {
    document.body.classList.toggle('dark');
    if (chartsDrawn) updateChartColors();
});

// Menu Hamburger
document.getElementById('menuBtn').addEventListener('click', function() {
    const menuContent = document.getElementById('menuContent');
    menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
});

// Inizializzazione
window.onload = function() {
    if (!localStorage.getItem('tutorialShown')) {
        showTutorialModal();
        localStorage.setItem('tutorialShown', 'true');
    } else if (localStorage.getItem('messageHistory')) {
        loadSavedData();
        addMessage("Bentornato! Vuoi continuare da dove eri rimasto o ripartire?", 'bot');
        addQuickReplies(['Continuare', 'Ripartire']);
        step = 0;
    } else {
        startChat();
    }
};