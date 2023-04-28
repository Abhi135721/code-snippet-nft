var express = require('./node_modules/express');
var app = express();
app.use(express.static('src'));
app.use(express.static('../csnft-contract/build/contracts'));
app.get('/', function (req, res) {
  res.render("index.html");
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Code Snippet NFT Dapp listening on port 3000!');
});