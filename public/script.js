const inputField = document.getElementById('user-input')
const sendBtn = document.getElementById('send-btn')
const messagesContainer = document.getElementById('messages')
const retrievalMethod = document.getElementById('retrieval-method')
const uploadBtn = document.getElementById('upload-btn')

const sendMessage = () => {
    let userMessage = inputField.value.trim();
    if (userMessage === "") {
        alert("You submitted an empty message");
    } else {
        const elem = document.createElement('div');
        elem.classList.add('message', 'user');

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = userMessage;

        elem.appendChild(bubble);
        messagesContainer.appendChild(elem);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    inputField.value = '';
}

sendBtn.addEventListener('click', sendMessage);

inputField.addEventListener('keydown', function (event) {
    if (event.key == 'Enter') {
        sendMessage();
    }
});

retrievalMethod.addEventListener('change', function () {
    const selectedMethod = retrievalMethod.value;
    console.log("Retrieval method: " + selectedMethod);
});

uploadBtn.addEventListener('click', function () {
    const file = document.getElementById('file-input').files[0];
    console.log("Selected file: " + file.name);
});
