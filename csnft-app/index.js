var express = require('./node_modules/express');
var app = express();
app.use(express.static('src'));
app.get('/', function (req, res) {
  res.render("index.html");
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Counter Dapp listening on port 3000!');
});