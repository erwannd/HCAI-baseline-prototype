const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/chat', (req, res) => {
    const userMessage = req.body['user-input'];
    const retrivalMethod = req.body['retrieval-method'];

    console.log('User Message:', userMessage);
    console.log('Retrieval Method:', retrivalMethod);

    res.send({ responseRecieved: { userMessage}, responseToUser: "Message Received!"})
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});