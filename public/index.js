const participantInput = document.getElementById('participant-id')
const proceedBtn = document.getElementById('proceed-btn')

/**
 * Save participantID to local storage.
 * @returns {{ ok: boolean, participantID: string | null }}
 */
const storeParticipantID = () => {
    const participantID = participantInput.value.trim();

    if (!participantID) {
        alert('Please enter a participant ID.');
        return { ok: false, participantID: null };
    }

    localStorage.setItem('participantID', participantID);
    return { ok: true, participantID };
}

/**
 * Returns the systemID for this participant.
 * @param {number} participantID 
 * @returns 1 if participantID is odd, otherwise returns 2
 */
const getSystemID = (participantID) => {
    return parseInt(participantID, 10) % 2 === 1 ? 1 : 2;
}

const proceedToChat = () => {
    const { ok, participantID } = storeParticipantID()
    if (!ok) {
        return;
    }

    const systemID = getSystemID(participantID)
    localStorage.setItem('systemID', systemID);
    window.location.href = `/chat.html?participantID=${participantID}&systemID=${systemID}`;
}

// Redirect to chat page with participantID and systemID in the URL
proceedBtn.addEventListener('click', proceedToChat);

// Redirect to chat page with participantID and systemID in the URL
participantInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        proceedToChat();
    }
});
