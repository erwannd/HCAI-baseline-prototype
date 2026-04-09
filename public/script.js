/**
 * Get participantID from URL query string.
 * Fallback to localStorage.
 * If not found, redirects to index.html.
 */
const params = new URLSearchParams(window.location.search);
const participantID = params.get('participantID') || localStorage.getItem('participantID');
const systemID = params.get('systemID') || localStorage.getItem('systemID');

if (!participantID) {
    alert('Please enter your participant ID first.');
    // redirect to login
    window.location.href = '/';
}

console.log(`participantID: ${participantID}`)

const inputField = document.getElementById('user-input')
const sendBtn = document.getElementById('send-btn')
const messagesContainer = document.getElementById('messages')
const retrievalMethod = document.getElementById('retrieval-method')
const uploadBtn = document.getElementById('upload-btn')
const fileInput = document.getElementById('file-input')
const evidenceList = document.getElementById('evidence-list');
const evidenceEmpty = document.getElementById('evidence-empty');
const metricOverall = document.getElementById('metric-overall');
const metricRetrieval = document.getElementById('metric-retrieval');
const metricResponse = document.getElementById('metric-response');
const metricMethod = document.getElementById('metric-method');

// TODO: maybe move this to config
const MAX_INTERACTIONS = 5
const conversationHistory = [];

/**
 * Create a message bubble & append it to the Chat Container
 * @param {string} message the message
 * @param {string} role 'user' OR 'assistant'
 */
const createChatMessage = (message, role) => {
    const elem = document.createElement('div');
    elem.classList.add('message', role);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = message;

    elem.appendChild(bubble);
    messagesContainer.appendChild(elem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderRetrievedEvidence(docs) {
    evidenceList.innerHTML = '';

    evidenceEmpty.style.display = 'none';

    docs.forEach((doc) => {
        const item = document.createElement('div');
        item.className = 'doc-item';
        item.textContent = `${doc.docName} | Chunk ${doc.chunkIndex} | Score: ${doc.relevanceScore}`;
        evidenceList.appendChild(item);

        const text = document.createElement('p');
        text.textContent = doc.chunkText;
        evidenceList.appendChild(text);
    });
}

function renderConfidenceMetrics(metrics) {
    metricOverall.textContent = metrics.overallConfidence;
    metricRetrieval.textContent = metrics.retrievalConfidence;
    metricResponse.textContent = metrics.responseConfidence;
    metricMethod.textContent = metrics.retrievalMethod;
}



function logEvent(type, element) {
    fetch('/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            participantID: participantID,
            eventType: type,
            elementName: element,
            timestamp: new Date()
        })
    });
}

/**
 * Submits conversation history to the server.
 * Sends the most recent 'N' messages between user and assitant.
 * @returns
 */
const sendMessage = async () => {
    // Display message & clear input field
    let userMessage = inputField.value.trim();
    if (userMessage === "") {
        alert("You submitted an empty message");
        return
    } else {
        createChatMessage(userMessage, 'user');
    }
    inputField.value = '';

    // Send message to server
    try {
        const recentHistory = conversationHistory.slice(- MAX_INTERACTIONS * 2);
        let payload = {};

        if (recentHistory.length === 0) {
            payload = {
                input: userMessage,
                retrievalMethod: retrievalMethod.value,
                participantID,
                systemID,
            };
        } else {
            payload = {
                history: recentHistory,
                input: userMessage,
                participantID,
                systemID,
                retrievalMethod: retrievalMethod.value
            };
        }

        const resp = await fetch("/chat", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (resp.ok) {
            let data = await resp.json();
            createChatMessage(data.botResponse, 'assistant');
            conversationHistory.push({ role: 'user', content: userMessage });
            conversationHistory.push({ role: 'assistant', content: data.botResponse });
            renderRetrievedEvidence(data.retrievedDocuments);
            renderConfidenceMetrics(data.confidenceMetrics);

        } else {
            console.error("Failed to fetch response from server")
        }
    } catch (err) {
        console.error("Fetch response from server: ", err)
    }
}

/**
 * Load existing chat history for this participant.
 */
const loadChatHistory = async () => {
    try {
        // TODO: change /history route on server.js
        const resp = await fetch('/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send participantID to the server and maximum conversation exchanges
            body: JSON.stringify({ participantID, limit: MAX_INTERACTIONS })
        });
        if (!resp.ok) {
            console.error('Failed to load chat history');
            return;
        }

        const history = await resp.json();

        if (history.interactions && history.interactions.length > 0) {
            history.interactions.forEach((interaction) => {
                createChatMessage(interaction.userInput, 'user');
                createChatMessage(interaction.botResponse, 'assistant');

                conversationHistory.push({
                    role: 'user', content: interaction.userInput
                })
                conversationHistory.push({
                    role: 'assistant', content: interaction.botResponse
                })
            });
        }
    } catch (err) {
        console.error('Error loading chat history:', err);
    }
}

// Load chat history for this participant after HTML is parsed
document.addEventListener('DOMContentLoaded', loadChatHistory)

// Send message to OpenAI on button click
sendBtn.addEventListener('click', function () {
    logEvent('click', 'SendButton');
    sendMessage();
});

// Send message to OpenAI on Enter
inputField.addEventListener('keydown', function (event) {
    if (event.key == 'Enter') {
        logEvent('keydown', 'UserInput');
        sendMessage();
    }
});

/* Log user interactions */
sendBtn.addEventListener('mouseenter', function () {
    logEvent('hover', 'SendButton');
});

inputField.addEventListener('focus', function () {
    logEvent('focus', 'UserInput');
});

retrievalMethod.addEventListener('change', function () {
    const selectedMethod = retrievalMethod.value;
    console.log("Retrieval method: " + selectedMethod);
    logEvent('change', 'RetrievalMethodDropdown');
});

retrievalMethod.addEventListener('focus', function () {
    logEvent('focus', 'RetrievalMethodDropdown');
});

uploadBtn.addEventListener('click', async function () {
    const file = document.getElementById('file-input').files[0];
    if (file) {
        console.log("Selected file: " + file.name);
    }
    const formData = new FormData();

    formData.append('document', file);

    const response = await fetch("/upload-document", {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    await loadDocuments();
    logEvent('click', 'UploadButton');
});

async function loadDocuments() {
    const response = await fetch("/documents");
    const docs = await response.json();

    const documentsList = document.getElementById("empty-msg");
    documentsList.innerHTML = "";

    docs.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = doc.filename + " " + doc.processingStatus;
        documentsList.appendChild(li);
    });
}

uploadBtn.addEventListener('mouseenter', function () {
    logEvent('hover', 'UploadButton');
});

fileInput.addEventListener('click', function () {
    const file = document.getElementById('file-input');
    console.log("Button Selected");
    logEvent('click', 'FileInput');
});
