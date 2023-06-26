const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Enable JSON body parsing
app.use(bodyParser.json());

// Simulated initial vote counts
let candidateVotes = {
  candidate1: 0,
  candidate2: 0,
  candidate3: 0
};

// Endpoint to record a new vote
app.post('/vote', (req, res) => {
  const selectedCandidate = req.body.candidate;

  if (!selectedCandidate || !candidateVotes[selectedCandidate]) {
    return res.status(400).json({ error: 'Invalid candidate selection' });
  }

  candidateVotes[selectedCandidate]++;
  io.emit('vote', candidateVotes); // Broadcast updated vote counts to all connected clients
  res.status(200).json({ message: 'Vote recorded successfully' });
});

// Endpoint to retrieve live results
app.get('/results', (req, res) => {
  res.status(200).json(candidateVotes);
});

// Serve index.html for the public-facing website
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve admin.html for the admin page
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

// Start the server
const port = 5500;
http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Socket.io connection event
io.on('connection', socket => {
  console.log('A client connected');
  socket.emit('vote', candidateVotes); // Send initial vote counts to the newly connected client
});
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  