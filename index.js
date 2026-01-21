require('dotenv').config()
require('./database/connection')

const express = require('express')
const cors = require('cors')
const server = express()
const PORT = 4000 || process.env.PORT

server.use(cors())
server.use(express.json())


server.listen(PORT, () => {
    console.log("Server started at port number " + PORT + "");
})