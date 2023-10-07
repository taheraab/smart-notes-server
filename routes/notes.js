const express = require('express')
const crypto = require("crypto")

const router = express.Router()

const notes = [];

// get all notes
router.get('/', (req, res) => {
  res.json({
    error: false,
    data: notes
  });
})

// get a particular note with id
router.get('/:id', (req, res) => {
  const noteId = req.params.id;
  const filteredNotes = notes.filter(({id}) => id === noteId);
  
  if (!filteredNotes.length) {
    return res.send({
      error: true,
      errorMessage: `Note with ${noteId} not found`
    })
  } 

  res.send({
    error: false,
    data: filteredNotes[0]
  });
})

// Add a note
router.post('/add', (req, res) => {
  const note = {
    id: crypto.randomUUID(),
    ...req.body.note,
  };

  notes.push(note);

  res.send({
    error: false,
    data: note
  });
})

// Update note
router.post('/update/:id', (req, res) => {
  const noteId = req.params.id;
  const noteIndex = notes.findIndex(({id}) => id === noteId);
  
  if (noteIndex === -1) {
    return res.send({
      error: true,
      errorMessage: `Note with ${noteId} not found`
    })
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    ...req.note
  }

  res.send({
    error: false,
    data: notes[noteIndex]
  })
})

module.exports = router