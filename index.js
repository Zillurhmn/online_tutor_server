const express = require('express')

const app = express()
const port = 3000

app.get('/backend', (req, res) => {
  res.send('Hello World! From Nehal')
})
app.get('/backend/login', (req, res) => {
  res.send('Hello World! From Nehal . This is a Login database')
})
app.get('/backend/search', (req, res) => {
  res.send('Hello World! From Nehal  This is a search database')
})
app.get('/backend/register', (req, res) => {
  res.send('Hello World! From Nehal  This is a Register database')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})