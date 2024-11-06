require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

let urlDatabase = {};
let idCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;
  const urlPattern = /^(http|https):\/\/[^ "]+$/;

    if (!urlPattern.test(originalUrl)) {
        return res.json({ error: 'invalid url' });
    }

    const hostname = url.parse(originalUrl).hostname;

    try {
        await dns.promises.lookup(hostname);
        const shortUrl = idCounter++;
        urlDatabase[shortUrl] = originalUrl;
        res.json({ original_url: originalUrl, short_url: shortUrl });
    } catch (err) {
        res.json({ error: 'invalid url' });
    }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
      res.redirect(originalUrl);
  } else {
      res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
