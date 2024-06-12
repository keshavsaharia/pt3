const path = require('path')
const express = require('express')
const exec = require('child_process').execSync

const app = express()
const port = 8080

app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
    exec('open http://localhost:' + port)
})