const participantInput = document.getElementById('participant-id')
const proceedBtn = document.getElementById('proceed-btn')

/**
 * Save participantID to local storage.
 * @returns None
 */
const storeParticipantID = () => {
    const participantID = participantInput.value.trim();

    if (!participantID) {
        alert('Please enter a participant ID.');
        return false;
    }

    localStorage.setItem('participantID', participantID);
    return true;
}

proceedBtn.addEventListener('click', () => {
    if (storeParticipantID()) {
        window.location.href = '/chat.html';
    }
});

participantInput.addEventListener('keydown', function (event) {
    if (event.key == 'Enter' && storeParticipantID()) {
        window.location.href = '/chat.html';
    }
});