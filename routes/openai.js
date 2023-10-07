const express = require('express')
const router = express.Router()

// Summarize given text
router.get('/summarize', (req, res) => {
  res.send('Some summary')
})

module.exports = router