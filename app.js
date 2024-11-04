const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file from the "views" directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
