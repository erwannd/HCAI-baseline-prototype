const params = new URLSearchParams(window.location.search);
const participantID = params.get('participantID') || localStorage.getItem('participantID');
const systemID = params.get('systemID') || localStorage.getItem('systemID');

if (!participantID) {
    alert('Please enter your participant ID first.');
    window.location.href = '/';
}

if (participantID) {
    localStorage.setItem('participantID', participantID);
}

if (systemID) {
    localStorage.setItem('systemID', systemID);
}

const stateKey = `workflowState:${participantID}`;

const taskBtn = document.getElementById('task-btn');
const prototypeBtn = document.getElementById('prototype-btn');
const taskPanel = document.getElementById('task-panel');
const taskCompleteBtn = document.getElementById('task-complete-btn');
const participantDisplay = document.getElementById('participant-display');

const getInitialState = () => {
    try {
        return JSON.parse(localStorage.getItem(stateKey)) || {
            surveyComplete: false,
            taskComplete: false
        };
    } catch (error) {
        return {
            surveyComplete: false,
            taskComplete: false
        };
    }
};

let workflowState = getInitialState();

const saveState = () => {
    localStorage.setItem(stateKey, JSON.stringify(workflowState));
};

const setStepState = (stepName, status, label) => {
    const step = document.querySelector(`[data-step="${stepName}"]`);
    const button = step.querySelector('.workflow-btn');
    const statusText = step.querySelector('.workflow-status');

    step.classList.remove('is-active', 'is-complete', 'is-locked');
    step.classList.add(`is-${status}`);
    statusText.textContent = label;
    button.disabled = status === 'locked';
};

const renderWorkflow = () => {
    setStepState('survey', workflowState.surveyComplete ? 'complete' : 'active', workflowState.surveyComplete ? 'Done' : 'Ready');
    setStepState('task', workflowState.surveyComplete ? (workflowState.taskComplete ? 'complete' : 'active') : 'locked', workflowState.surveyComplete ? (workflowState.taskComplete ? 'Done' : 'Ready') : 'Locked');
    setStepState('prototype', workflowState.taskComplete ? 'active' : 'locked', workflowState.taskComplete ? 'Ready' : 'Locked');
};

const buildQuery = () => {
    const query = new URLSearchParams();
    query.set('participantID', participantID);

    if (systemID) {
        query.set('systemID', systemID);
    }

    return query.toString();
};

participantDisplay.textContent = participantID;
renderWorkflow();


taskBtn.addEventListener('click', () => {
    taskPanel.hidden = false;
    taskPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

taskCompleteBtn.addEventListener('click', () => {
    workflowState.taskComplete = true;
    saveState();
    renderWorkflow();
});

prototypeBtn.addEventListener('click', () => {
    window.location.href = `/chat.html?${buildQuery()}`;
});
