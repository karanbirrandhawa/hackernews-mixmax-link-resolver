// Leveraged Brad Vogel's giphy-example-resolver
// https://github.com/mixmaxhq/giphy-example-link-resolver/blob/master/server.js
var express = require('express');
var app = express();
var sync = require('synchronize');
var cors = require('cors');

// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
  sync.fiber(next);
});

// Since Mixmax calls this API directly from the client-side, it must be whitelisted.
var corsOptions = {
  origin: /^[^.\s]+\.mixmax\.com$/,
  credentials: true
};

app.get('/resolver', cors(corsOptions), require('./api/resolver'));

app.listen(process.env.PORT || 9146);