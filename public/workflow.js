const params = new URLSearchParams(window.location.search);
const participantID = params.get('participantID') || localStorage.getItem('participantID');
const systemID = params.get('systemID') || localStorage.getItem('systemID');
const enhancedPrototypeUrl = 'https://hcai-enhanced-prototype-1.onrender.com';

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

const surveyBtn = document.getElementById('survey-btn');
const taskBtn = document.getElementById('task-btn');
const prePrototypeSurveyBtn = document.getElementById('pre-prototype-survey-btn');
const prePrototypeSurveyBtnTwo = document.getElementById('pre-prototype-survey-btn-2');
const prototypeBtn = document.getElementById('prototype-btn');
const postSurveyBtn = document.getElementById('post-survey-btn');
const taskPanel = document.getElementById('task-panel');
const taskCompleteBtn = document.getElementById('task-complete-btn');
const participantDisplay = document.getElementById('participant-display');

const getInitialState = () => {
    try {
        return JSON.parse(localStorage.getItem(stateKey)) || {
            surveyStarted: false,
            taskComplete: false,
            prePrototypeSurveyStarted: false,
            prePrototypeSurveyTwoStarted: false,
            prototypeStarted: false,
            postSurveyStarted: false,
        };
    } catch (error) {
        return {
            surveyStarted: false,
            taskComplete: false,
            prePrototypeSurveyStarted: false,
            prePrototypeSurveyTwoStarted: false,
            prototypeStarted: false,
            postSurveyStarted: false,
        };
    }
};

let workflowState = getInitialState();

const saveState = () => {
    localStorage.setItem(stateKey, JSON.stringify(workflowState));
};

const setStepState = (stepName, status, label) => {
    const step = document.querySelector(`[data-step="${stepName}"]`);

    if (!step) {
        return;
    }

    const button = step.querySelector('.workflow-btn');
    const statusText = step.querySelector('.workflow-status');

    step.classList.remove('is-active', 'is-complete', 'is-locked');
    step.classList.add(`is-${status}`);
    statusText.textContent = label;
    button.disabled = status === 'locked';
};

const renderWorkflow = () => {
    setStepState(
        'survey',
        workflowState.surveyStarted ? 'complete' : 'active',
        workflowState.surveyStarted ? 'Started' : 'Ready',
    );

    setStepState(
        'task',
        workflowState.surveyStarted
            ? (workflowState.taskComplete ? 'complete' : 'active')
            : 'locked',
        workflowState.surveyStarted
            ? (workflowState.taskComplete ? 'Done' : 'Ready')
            : 'Locked',
    );

    setStepState(
        'pre-prototype-survey',
        workflowState.taskComplete
            ? (workflowState.prePrototypeSurveyStarted ? 'complete' : 'active')
            : 'locked',
        workflowState.taskComplete
            ? (workflowState.prePrototypeSurveyStarted ? 'Started' : 'Ready')
            : 'Locked',
    );

    setStepState(
        'pre-prototype-survey-2',
        workflowState.prePrototypeSurveyStarted
            ? (workflowState.prePrototypeSurveyTwoStarted ? 'complete' : 'active')
            : 'locked',
        workflowState.prePrototypeSurveyStarted
            ? (workflowState.prePrototypeSurveyTwoStarted ? 'Started' : 'Ready')
            : 'Locked',
    );

    setStepState(
        'prototype',
        workflowState.prePrototypeSurveyTwoStarted
            ? (workflowState.prototypeStarted ? 'complete' : 'active')
            : 'locked',
        workflowState.prePrototypeSurveyTwoStarted
            ? (workflowState.prototypeStarted ? 'Started' : 'Ready')
            : 'Locked',
    );

    setStepState(
        'post-survey',
        workflowState.prototypeStarted
            ? (workflowState.postSurveyStarted ? 'complete' : 'active')
            : 'locked',
        workflowState.prototypeStarted
            ? (workflowState.postSurveyStarted ? 'Started' : 'Ready')
            : 'Locked',
    );
};

const buildQuery = () => {
    const query = new URLSearchParams();
    query.set('participantID', participantID);

    if (systemID) {
        query.set('systemID', systemID);
    }

    return query.toString();
};

function logEvent(type, element) {
    fetch('/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            participantID,
            eventType: type,
            elementName: element,
            timestamp: new Date(),
        }),
    }).catch(() => undefined);
}

function openSurvey(endpoint, stateKeyName, elementName) {
    workflowState[stateKeyName] = true;
    saveState();
    renderWorkflow();

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantID }),
    })
        .then((response) => response.text())
        .then((url) => {
            logEvent('redirect', elementName);
            window.open(url, '_blank');
        })
        .catch((error) => {
            console.error(`Error redirecting to ${elementName}:`, error);
            alert('There was an error redirecting to the survey. Please try again.');
        });
}

participantDisplay.textContent = participantID;
renderWorkflow();

surveyBtn?.addEventListener('click', () => {
    openSurvey('/redirect-to-survey', 'surveyStarted', 'Demographics Survey');
});

taskBtn?.addEventListener('click', () => {
    taskPanel.hidden = false;
    taskPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

taskCompleteBtn?.addEventListener('click', () => {
    workflowState.taskComplete = true;
    saveState();
    renderWorkflow();
});

prePrototypeSurveyBtn?.addEventListener('click', () => {
    openSurvey('/redirect-to-pre-prototype-survey', 'prePrototypeSurveyStarted', 'Pre-Task Survey');
});

prePrototypeSurveyBtnTwo?.addEventListener('click', () => {
    openSurvey(
        '/redirect-to-pre-prototype-survey-two',
        'prePrototypeSurveyTwoStarted',
        'Pre-Task Knowledge Survey',
    );
});

prototypeBtn?.addEventListener('click', () => {
    workflowState.prototypeStarted = true;
    saveState();
    renderWorkflow();

    if (String(systemID) === '2') {
        window.location.href = `${enhancedPrototypeUrl}/?${buildQuery()}`;
        return;
    }

    window.location.href = `/chat.html?${buildQuery()}`;
});

postSurveyBtn?.addEventListener('click', () => {
    openSurvey('/redirect-to-post-survey', 'postSurveyStarted', 'Post-Task Survey');
});
