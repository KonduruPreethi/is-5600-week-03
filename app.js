const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(__dirname + '/public'));

// Chat emitter to broadcast messages
const chatEmitter = new EventEmitter();


function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}


function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}


function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}


function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}


function respondChat(req, res) {
  const { message } = req.query;

  console.log("Received message:", message);
  chatEmitter.emit('message', message);
  res.end();
}


function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Define routes
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
