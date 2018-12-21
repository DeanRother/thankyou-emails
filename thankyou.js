var express = require('express');
var sql = require('mssql');


var app = express();

app.set('port',process.env.PORT||3000);

var config = {
  user: 'thankyou-editor',
  password: 'thankyou-123',
  server: '1YB1Z12-DROTHER\\DEV2014',
  database: 'ThankYou',
  options: {
    encrypt: false
  }
};

app.get('/sql', function(req,res){
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request().query("select * from ThankYouEmail");
  }).then(result => {
    let rows = result.recordset;
    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(200).json(rows);
    sql.close();
  }).catch(err => {
    res.status(500).send(err);
    sql.close();
  });
});

app.get('/', function(req, res){
  res.type('text/plain');
  res.send('Thank you email home page.');
});

app.get('/fme', function(req,res){
  res.type('text/plain');
  res.send('http://fmeserver.laredoenergy.com/fmedatastreaming/Experimental/getThankYous.fmw?');
});


app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
