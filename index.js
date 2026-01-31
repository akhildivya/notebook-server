require('dotenv').config()
require('./database/connection')
const router=require('./routes/routes')

const express = require('express')
const cors = require('cors')
const server = express()
const PORT = 4000 || process.env.PORT
const corsOptions = {
  origin: 'https://comfy-blini-e0bf4a.netlify.app',  // allow only this frontend
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],     // allowed methods
                                 // if you are sending cookies/auth headers
};

server.use(cors(corsOptions))
server.use(cors())
server.use(express.json())
server.get('/api/health', (req, res) => {
  res.status(200).send('OK')
})
server.use(router)

server.listen(PORT, () => {
    console.log("Server started at port number " + PORT + "");
})