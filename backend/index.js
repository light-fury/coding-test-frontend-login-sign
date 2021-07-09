require('dotenv').config();
const { ethers } = require('ethers');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compress = require('compression');
const bodyParser = require('body-parser');
const app = express();

const port = 4000;

// MIDDLEWARE
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(helmet());
app.use(cors());

app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString(); // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce);
});

app.post('/auth', function (req, res) {
  try {
    const { address, signature, nonce } = req.body;
    const msgHash = ethers.utils.hashMessage(nonce);
    const msgHashBytes = ethers.utils.arrayify(msgHash);

    // Now you have the digest,
    const recoveredAddress = ethers.utils.recoverAddress(msgHashBytes, signature);

    if (recoveredAddress !== address) {
      return res.status(401).send();
    }

    res.send("Hello World!");
  } catch (error) {
    res.status(404);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});