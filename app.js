/**
 * app.js - Logic for Pushdown Automaton (PDA) Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const transitionsBody = document.getElementById('transitions-body');
    const addTransitionBtn = document.getElementById('add-transition-btn');
    const loadExampleBtn = document.getElementById('load-example-btn');
    
    const inputField = document.getElementById('simulation-input');
    const btnLoad = document.getElementById('btn-load');
    const btnReset = document.getElementById('btn-reset');
    const btnStep = document.getElementById('btn-step');
    const btnPlay = document.getElementById('btn-play');
    
    const simStatusBadge = document.getElementById('sim-status-badge');
    const currentStateDisplay = document.getElementById('current-state-display');
    const transitionMessage = document.getElementById('transition-message');
    const inputTape = document.getElementById('input-tape');
    const stackVisualizer = document.getElementById('stack-visualizer');
    
    // === State ===
    let transitions = [];
    let pdaState = {
        currentState: '',
        stack: [],
        inputData: '',
        pointer: 0,
        status: 'idle', // idle, running, accepted, rejected
        isAutoPlaying: false
    };
    let playInterval = null;

    // === Constants ===
    const EPSILON = 'ε';

    // === Initialization ===
    function init() {
        bindTabs();
        bindControls();
        loadExamplePDA();
    }

    // === UI Tabs ===
    function bindTabs() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                // Add active class
                btn.classList.add('active');
                document.getElementById(btn.dataset.target).classList.add('active');
            });
        });
    }

    // === Controls Binding ===
    function bindControls() {
        addTransitionBtn.addEventListener('click', () => addTransitionRow());
        loadExampleBtn.addEventListener('click', loadExamplePDA);
        
        btnLoad.addEventListener('click', loadSimulation);
        btnReset.addEventListener('click', resetSimulation);
        btnStep.addEventListener('click', stepSimulation);
        
        btnPlay.addEventListener('click', () => {
            if (pdaState.isAutoPlaying) {
                pauseAutoPlay();
            } else {
                startAutoPlay();
            }
        });
    }

    // === PDA Definition Management ===
    function addTransitionRow(t = { state: 'q0', input: '', stackTop: '', nextState: 'q0', push: '' }) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${t.state}" class="t-state" placeholder="q0"></td>
            <td><input type="text" value="${t.input}" class="t-input" placeholder="ε"></td>
            <td><input type="text" value="${t.stackTop}" class="t-stop" placeholder="ε"></td>
            <td><input type="text" value="${t.nextState}" class="t-nstate" placeholder="q1"></td>
            <td><input type="text" value="${t.push}" class="t-push" placeholder="ε"></td>
            <td><button class="delete-row-btn" title="Remove">&times;</button></td>
        `;
        
        tr.querySelector('.delete-row-btn').addEventListener('click', () => {
            tr.remove();
        });
        
        transitionsBody.appendChild(tr);
    }

    function collectTransitions() {
        const rows = transitionsBody.querySelectorAll('tr');
        const collected = [];
        rows.forEach(row => {
            const state = row.querySelector('.t-state').value.trim();
            const input = row.querySelector('.t-input').value.trim();
            const stackTop = row.querySelector('.t-stop').value.trim();
            const nextState = row.querySelector('.t-nstate').value.trim();
            const push = row.querySelector('.t-push').value.trim();
            
            if (state && nextState) { /* Minimum requirement */
                collected.push({
                    state,
                    input: input === '' ? EPSILON : input,
                    stackTop: stackTop === '' ? EPSILON : stackTop,
                    nextState,
                    push: push === '' ? EPSILON : push
                });
            }
        });
        return collected;
    }

    function loadExamplePDA() {
        transitionsBody.innerHTML = '';
        const example = [
            { state: 'q0', input: '0', stackTop: 'ε', nextState: 'q0', push: 'X' },
            { state: 'q0', input: 'ε', stackTop: 'ε', nextState: 'q1', push: 'ε' },
            { state: 'q1', input: '1', stackTop: 'X', nextState: 'q1', push: 'ε' },
            { state: 'q1', input: 'ε', stackTop: 'Z', nextState: 'q2', push: 'Z' },
        ];
        example.forEach(addTransitionRow);
        document.getElementById('pda-start-state').value = 'q0';
        document.getElementById('pda-accept-states').value = 'q2';
        document.getElementById('pda-start-stack').value = 'Z';
        document.getElementById('simulation-input').value = '0011';
    }

    // === Simulation Engine ===
    function getPDAConfig() {
        return {
            startState: document.getElementById('pda-start-state').value.trim(),
            acceptStates: document.getElementById('pda-accept-states').value.split(',').map(s => s.trim()).filter(s => s),
            startStack: document.getElementById('pda-start-stack').value.trim(),
        };
    }

    function loadSimulation() {
        pauseAutoPlay();
        transitions = collectTransitions();
        const config = getPDAConfig();
        const inputStr = inputField.value.trim();

        if (!config.startState) {
            alert("Please define a Start State.");
            return;
        }

        pdaState.currentState = config.startState;
        pdaState.stack = config.startStack ? config.startStack.split('').reverse() : [];
        pdaState.inputData = inputStr;
        pdaState.pointer = 0;
        pdaState.status = 'running';
        
        simStatusBadge.textContent = 'Running';
        simStatusBadge.className = 'status-badge running';
        transitionMessage.textContent = 'Simulation loaded. Ready to step.';

        btnStep.disabled = false;
        btnPlay.disabled = false;
        btnReset.disabled = false;
        btnLoad.disabled = true;
        inputField.disabled = true;

        renderState();
    }

    function resetSimulation() {
        pauseAutoPlay();
        pdaState.status = 'idle';
        simStatusBadge.textContent = 'Idle';
        simStatusBadge.className = 'status-badge idle';
        
        btnStep.disabled = true;
        btnPlay.disabled = true;
        btnReset.disabled = true;
        btnLoad.disabled = false;
        inputField.disabled = false;
        
        currentStateDisplay.textContent = '-';
        transitionMessage.textContent = 'Initialize simulation to begin.';
        inputTape.innerHTML = '';
        stackVisualizer.innerHTML = '<div class="empty-stack-placeholder">Stack is empty</div>';
    }

    function renderState() {
        // State
        currentStateDisplay.textContent = pdaState.currentState;
        
        // Tape
        inputTape.innerHTML = '';
        if (pdaState.inputData.length === 0) {
            const cell = document.createElement('div');
            cell.className = 'tape-cell active';
            cell.textContent = EPSILON;
            inputTape.appendChild(cell);
        } else {
            for (let i = 0; i < pdaState.inputData.length; i++) {
                const cell = document.createElement('div');
                cell.className = 'tape-cell';
                if (i < pdaState.pointer) cell.classList.add('consumed');
                else if (i === pdaState.pointer && pdaState.status === 'running') cell.classList.add('active');
                cell.textContent = pdaState.inputData[i];
                inputTape.appendChild(cell);
            }
            // End of string marker
            const endCell = document.createElement('div');
            endCell.className = `tape-cell ${pdaState.pointer >= pdaState.inputData.length ? 'active' : ''}`;
            endCell.textContent = '∆';
            endCell.title = "End of Input";
            inputTape.appendChild(endCell);
        }

        // Stack
        renderStack(false); // Render without animation initially
    }

    function renderStack(animate = false) {
        stackVisualizer.innerHTML = '';
        if (pdaState.stack.length === 0) {
            stackVisualizer.innerHTML = '<div class="empty-stack-placeholder">Stack is empty</div>';
            return;
        }

        // Render from bottom to top, but DOM is flex-end so DOM order is natural bottom-to-top
        // The array: index 0 is bottom, index length-1 is top.
        for (let i = 0; i < pdaState.stack.length; i++) {
            const el = document.createElement('div');
            el.className = 'stack-item';
            el.textContent = pdaState.stack[i];
            
            // If top item and animating, add push animation
            if (animate && i === pdaState.stack.length - 1 && pdaState.lastOperation === 'push') {
                el.classList.add('anim-push');
            }
            stackVisualizer.appendChild(el);
        }
    }

    async function stepSimulation() {
        if (pdaState.status !== 'running') return;
        
        btnStep.disabled = true; // Disable until animation completes

        const currentInput = pdaState.pointer < pdaState.inputData.length ? pdaState.inputData[pdaState.pointer] : EPSILON;
        const topOfStack = pdaState.stack.length > 0 ? pdaState.stack[pdaState.stack.length - 1] : EPSILON;

        // 1. Find valid transition
        let selectedTrans = null;
        let consumesInput = false;
        let consumesStack = false;

        for (const t of transitions) {
            if (t.state === pdaState.currentState) {
                const matchInput = t.input === currentInput || t.input === EPSILON;
                const matchStack = t.stackTop === topOfStack || t.stackTop === EPSILON;

                if (matchInput && matchStack) {
                    selectedTrans = t;
                    consumesInput = t.input !== EPSILON;
                    consumesStack = t.stackTop !== EPSILON;
                    break; // Pick the first matching transition (Deterministic execution)
                }
            }
        }

        if (!selectedTrans) {
            checkAcceptance();
            return;
        }

        // 2. Report transition
        transitionMessage.innerHTML = `Applying: <code>δ(${selectedTrans.state}, ${selectedTrans.input}, ${selectedTrans.stackTop}) → (${selectedTrans.nextState}, ${selectedTrans.push})</code>`;

        // 3. Apply Transition
        pdaState.currentState = selectedTrans.nextState;
        
        // Handle Stack Pop
        if (consumesStack) {
            // Animation for Pop
            const topEl = stackVisualizer.lastChild;
            if (topEl && !topEl.classList.contains('empty-stack-placeholder')) {
                topEl.classList.add('anim-pop');
                await delay(300); // Wait for pop animation
            }
            pdaState.stack.pop();
        }

        // Handle Stack Push
        if (selectedTrans.push !== EPSILON) {
            // Push symbols. e.g. if rule says push 'XY', top becomes 'X'. We add them in reverse order.
            const symbolsToPush = selectedTrans.push.split('').reverse();
            for (const sym of symbolsToPush) {
                pdaState.stack.push(sym);
                pdaState.lastOperation = 'push';
                renderStack(true);
                await delay(200); // Staggered push animation
            }
        } else {
             // Re-render empty stack if needed
             renderStack(false);
        }

        // Handle Input
        if (consumesInput) {
            pdaState.pointer++;
        }

        renderState();
        checkAcceptance(); // Check if newly entered state causes acceptance

        if (pdaState.status === 'running') {
            btnStep.disabled = false;
        }
    }

    function checkAcceptance() {
        const config = getPDAConfig();
        const inputConsumed = pdaState.pointer >= pdaState.inputData.length;
        
        // Accept by Final State
        if (inputConsumed && config.acceptStates.includes(pdaState.currentState)) {
             setStatus('accepted', 'String Accepted! (Final State Reached)');
             return;
        }
        
        // Accept by Empty Stack (if no accept states defined)
        if (inputConsumed && config.acceptStates.length === 0 && pdaState.stack.length === 0) {
             setStatus('accepted', 'String Accepted! (Empty Stack)');
             return;
        }

        // If no transition found and string not accepted
        if (!hasValidTransition() && inputConsumed) {
            setStatus('rejected', 'String Rejected. No valid transitions left.');
        } else if (!hasValidTransition() && !inputConsumed) {
            setStatus('rejected', 'String Rejected. Automaton halted before consuming input.');
        }
    }

    function hasValidTransition() {
        const currentInput = pdaState.pointer < pdaState.inputData.length ? pdaState.inputData[pdaState.pointer] : EPSILON;
        const topOfStack = pdaState.stack.length > 0 ? pdaState.stack[pdaState.stack.length - 1] : EPSILON;

        return transitions.some(t => 
            t.state === pdaState.currentState &&
            (t.input === currentInput || t.input === EPSILON) &&
            (t.stackTop === topOfStack || t.stackTop === EPSILON)
        );
    }

    function setStatus(status, message) {
        pauseAutoPlay();
        pdaState.status = status;
        simStatusBadge.textContent = status.toUpperCase();
        simStatusBadge.className = `status-badge ${status}`;
        transitionMessage.textContent = message;
        btnStep.disabled = true;
        btnPlay.disabled = true;
    }

    // === Autoplay Logic ===
    function startAutoPlay() {
        pdaState.isAutoPlaying = true;
        document.getElementById('play-text').textContent = 'Pause';
        
        // Change icon to pause
        document.getElementById('play-icon').innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
        
        playInterval = setInterval(() => {
            if (pdaState.status === 'running' && !btnStep.disabled) {
                stepSimulation();
            } else if (pdaState.status !== 'running') {
                pauseAutoPlay();
            }
        }, 1000); // 1 step per second
    }

    function pauseAutoPlay() {
        pdaState.isAutoPlaying = false;
        clearInterval(playInterval);
        document.getElementById('play-text').textContent = 'Auto Play';
        
        // Change icon to play
        document.getElementById('play-icon').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }

    // === Utils ===
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Run
    init();
});
