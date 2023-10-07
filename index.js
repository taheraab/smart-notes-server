const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const notesRoute = require('./routes/notes');
const openaiRoute = require('./routes/openai');

const app = express();
const port = 3000;

app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

app.use('/notes', notesRoute);
app.use('/openai', openaiRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})