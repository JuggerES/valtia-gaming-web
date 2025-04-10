// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- Estado Global del Bracket (Simulación) ---
    let bracketData = { participants: [], rounds: [], currentRoundIndex: 0, isComplete: false };

    // --- Elementos DOM ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('#mobileMenu a, #mobileMenu button');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const applyBtns = document.querySelectorAll('.apply-btn');
    const messageBox = document.getElementById('messageBox');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const closeMessageBox = document.getElementById('closeMessageBox');
    const messageOkButton = document.getElementById('messageOkButton');
    const closeRegistrationBtn = document.getElementById('closeRegistrationBtn');
    const generateBracketBtn = document.getElementById('generateBracketBtn');
    const bracketGeneratorDiv = document.getElementById('bracket-generator');
    const bracketRoundsContainer = document.getElementById('bracket-rounds-container');
    const bracketPlaceholder = document.getElementById('bracket-placeholder');
    const tournamentSelect = document.getElementById('tournamentSelect');
    const rulesBtns = document.querySelectorAll('.rules-btn');

    // --- Funciones ---
    function showMessage(title, text) {
        if (messageTitle && messageText && messageBox) { // Verificar si existen los elementos
            messageTitle.textContent = title;
            messageText.textContent = text;
            messageBox.classList.remove('hidden');
        }
    }
    function hideMessage() {
        if (messageBox) { // Verificar si existe el elemento
            messageBox.classList.add('hidden');
        }
    }
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }

    // --- Bracket Logic Functions ---
    function initializeBracket(participantList) {
        bracketData.participants = [...participantList];
        shuffleArray(bracketData.participants);
        bracketData.rounds = []; bracketData.currentRoundIndex = 0; bracketData.isComplete = false;
        const firstRoundMatches = [];
        for (let i = 0; i < bracketData.participants.length; i += 2) {
            firstRoundMatches.push({ matchId: `r1m${(i / 2) + 1}`, p1: bracketData.participants[i], p2: bracketData.participants[i + 1] || null, winner: null, round: 1 });
        }
        bracketData.rounds.push(firstRoundMatches);
    }

    function renderRound(roundIndex) {
        const round = bracketData.rounds[roundIndex];
        if (!round || !bracketRoundsContainer) return; // Salir si no existe round o el contenedor

        const roundDiv = document.createElement('div');
        roundDiv.id = `round-${roundIndex + 1}`;
        roundDiv.classList.add('round-container', 'mb-6');
        let roundTitleText = ''; const numMatches = round.length;
        if (numMatches === 8) roundTitleText = 'Ronda 1 - Octavos de Final';
        else if (numMatches === 4) roundTitleText = 'Ronda 2 - Cuartos de Final';
        else if (numMatches === 2) roundTitleText = 'Ronda 3 - Semifinales';
        else if (numMatches === 1) roundTitleText = 'Ronda 4 - Gran Final';
        else roundTitleText = `Ronda ${roundIndex + 1}`;
        roundDiv.innerHTML = `<h5 class="text-lg round-title">${roundTitleText}</h5>`;
        round.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('bracket-match'); if (match.winner) matchDiv.classList.add('match-complete');
            matchDiv.dataset.matchId = match.matchId;
            const p1Button = document.createElement('button'); p1Button.classList.add('participant-btn'); p1Button.textContent = match.p1 || '---'; p1Button.dataset.participant = match.p1; p1Button.disabled = !!match.winner || !match.p1;
            const vsSpan = document.createElement('span'); vsSpan.classList.add('bracket-vs'); vsSpan.textContent = 'VS';
            const p2Button = document.createElement('button'); p2Button.classList.add('participant-btn'); p2Button.textContent = match.p2 || '---'; p2Button.dataset.participant = match.p2; p2Button.disabled = !!match.winner || !match.p2;
            if (match.winner) { if (match.winner === match.p1) { p1Button.classList.add('winner'); p2Button.classList.add('loser'); } else { p2Button.classList.add('winner'); p1Button.classList.add('loser'); } }
            matchDiv.appendChild(p1Button); matchDiv.appendChild(vsSpan); matchDiv.appendChild(p2Button);
            roundDiv.appendChild(matchDiv);
        });
        bracketRoundsContainer.appendChild(roundDiv);
    }

     function renderChampion(championName) {
         if(!bracketPlaceholder || !bracketRoundsContainer) return;
         bracketPlaceholder.classList.add('hidden'); bracketRoundsContainer.innerHTML = ''; // Clear previous rounds
         const winnerDiv = document.createElement('div'); winnerDiv.classList.add('tournament-winner');
         winnerDiv.innerHTML = `<span class="lucide">&#xea56;</span> <p>${championName}</p><p class="text-sm text-gray-400 mt-1">¡Campeón del Torneo!</p>`;
         bracketRoundsContainer.appendChild(winnerDiv); bracketData.isComplete = true;
    }

    function handleWinnerSelection(matchId, winnerName) {
        if (bracketData.isComplete) return; // No hacer nada si el torneo ya terminó
        const roundIndex = bracketData.currentRoundIndex;
        const match = bracketData.rounds[roundIndex]?.find(m => m.matchId === matchId);
        if (match && !match.winner) {
            match.winner = winnerName; updateMatchUI(matchId, winnerName);
            if (checkRoundComplete(roundIndex)) {
                if (bracketData.rounds[roundIndex].length > 1) {
                    generateNextRound(roundIndex); bracketData.currentRoundIndex++; renderRound(bracketData.currentRoundIndex);
                } else {
                    renderChampion(winnerName);
                    showMessage('¡Torneo Finalizado!', `El campeón es ${winnerName}.`);
                }
            }
        }
    }

    function updateMatchUI(matchId, winnerName) {
        if(!bracketRoundsContainer) return;
        const matchDiv = bracketRoundsContainer.querySelector(`.bracket-match[data-match-id="${matchId}"]`);
        if (matchDiv) {
            matchDiv.classList.add('match-complete'); const buttons = matchDiv.querySelectorAll('.participant-btn');
            buttons.forEach(button => { button.disabled = true; if (button.dataset.participant === winnerName) { button.classList.add('winner'); button.classList.remove('loser'); } else { button.classList.add('loser'); button.classList.remove('winner'); } });
        }
    }
    function checkRoundComplete(roundIndex) { const round = bracketData.rounds[roundIndex]; return round && round.every(match => match.winner !== null); }
    function generateNextRound(completedRoundIndex) {
        const winners = bracketData.rounds[completedRoundIndex].map(match => match.winner); const nextRoundMatches = []; const nextRoundNum = completedRoundIndex + 2;
        for (let i = 0; i < winners.length; i += 2) { nextRoundMatches.push({ matchId: `r${nextRoundNum}m${(i / 2) + 1}`, p1: winners[i], p2: winners[i + 1] || null, winner: null, round: nextRoundNum }); }
        bracketData.rounds.push(nextRoundMatches);
    }

    // --- Event Listeners ---
    mobileMenuBtn?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden')); // Añadido '?' por seguridad
    closeMessageBox?.addEventListener('click', hideMessage);
    messageOkButton?.addEventListener('click', hideMessage);
    [loginBtn, mobileLoginBtn].forEach(btn => btn?.addEventListener('click', () => showMessage('Iniciar Sesión', 'Esta función requiere un sistema de autenticación (backend).')));
    [registerBtn, mobileRegisterBtn].forEach(btn => btn?.addEventListener('click', () => showMessage('Registrarse', 'Esta función requiere un sistema de registro de usuarios (backend).')));
    applyBtns.forEach(button => button.addEventListener('click', () => { if (button.disabled) return; const t = button.getAttribute('data-tournament'); showMessage('Aplicar al Torneo', `La aplicación al torneo "${t}" requiere iniciar sesión y una base de datos (backend).`); }));

    closeRegistrationBtn?.addEventListener('click', () => {
        if (!closeRegistrationBtn || !tournamentSelect) return;
        closeRegistrationBtn.disabled = true;
        closeRegistrationBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-600', 'border-gray-600');
        closeRegistrationBtn.classList.remove('btn-secondary', 'hover:bg-opacity-10');
        if (generateBracketBtn) {
            generateBracketBtn.disabled = false;
            generateBracketBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            generateBracketBtn.classList.add('btn-primary');
        }
        showMessage('Inscripciones Cerradas', `Inscripciones cerradas para ${tournamentSelect.options[tournamentSelect.selectedIndex].text}. Ahora puedes generar las llaves.`);
    });

    generateBracketBtn?.addEventListener('click', () => {
        if (!bracketGeneratorDiv || !bracketRoundsContainer || !bracketPlaceholder || !tournamentSelect) return;
        bracketGeneratorDiv.classList.remove('hidden'); bracketRoundsContainer.innerHTML = ''; bracketPlaceholder.classList.remove('hidden');
        bracketPlaceholder.innerHTML = '<p class="text-gray-400 mb-4 animate-pulse">Generando llaves...</p>';
        const participants = ['Bjorn Piel de Hierro', 'Ragnar Lodbrok', 'Lagertha Escudera', 'Ivar Sin Huesos', 'Freya Valiente', 'Thor Odinson', 'Loki Astuto', 'Sigurd Ojo de Serpiente', 'Guerrero del Clan Cuervo', 'Valkiria del Norte', 'Berserker de Kattegat', 'Jarl Borg', 'Astrid Feroz', 'Erik el Rojo', 'Leif Erikson', 'Hechicero Rúnico'];
        if (participants.length !== 16) { bracketPlaceholder.innerHTML = '<p class="text-red-500">Error: Se necesitan 16 participantes para esta simulación.</p>'; return; }
        initializeBracket(participants);
        setTimeout(() => { bracketPlaceholder.classList.add('hidden'); renderRound(0); showMessage('Llaves Generadas', `Llave inicial generada para ${tournamentSelect.options[tournamentSelect.selectedIndex].text}. Haz clic en los nombres para seleccionar ganadores.`); }, 500);
    });

    bracketRoundsContainer?.addEventListener('click', (event) => { // Añadido '?' por seguridad
        const target = event.target;
        if (target.matches('.participant-btn') && !target.disabled) {
            const matchDiv = target.closest('.bracket-match');
            if (matchDiv) {
                const matchId = matchDiv.dataset.matchId;
                const winnerName = target.dataset.participant;
                handleWinnerSelection(matchId, winnerName);
            }
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', function (e) { const id = this.getAttribute('href'); if (id.length > 1) { const el = document.querySelector(id); if (el) { e.preventDefault(); const h = document.querySelector('header'); const offset = (h ? h.offsetHeight : 70) + 20; const pos = el.getBoundingClientRect().top + window.pageYOffset - offset; window.scrollTo({ top: pos, behavior: 'smooth' }); } } }));
    document.querySelectorAll('.gallery-item img').forEach(img => img.addEventListener('click', () => showMessage('Ver Imagen', `Clic en: ${img.alt}. Se necesita un modal (lightbox).`)));
    rulesBtns.forEach(button => { button.addEventListener('click', () => { const card = button.closest('.card'); if (!card) return; const rulesContent = card.querySelector('.rules-content'); const buttonTextSpan = button.querySelector('.btn-text'); const icon = button.querySelector('.lucide'); if (rulesContent && buttonTextSpan && icon) { rulesContent.classList.toggle('hidden'); if (rulesContent.classList.contains('hidden')) { buttonTextSpan.textContent = 'Ver Reglas'; icon.innerHTML = '&#xe965;'; } else { buttonTextSpan.textContent = 'Ocultar Reglas'; icon.innerHTML = '&#xe846;'; } } }); });

}); // Fin del DOMContentLoaded
