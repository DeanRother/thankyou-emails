var express = require('express');
var sql = require('mssql');
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser.urlencoded({extended:true}));

//app.use('/static', express.static(__dirname + 'views'));

app.get('/', function(req, res){
  res.type('text/text');
  res.send('Thank you email home page.');
  //res.type('text/html');
  //res.render('/thankyou');
});

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

app.get('/sql/:id', function(req,res){
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request().query('select * from ThankYouEmail where ID = ' + req.params.id);
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

app.post('/sql', function(req,res){
  var qry = "insert into dbo.ThankYouEmail(Gift,Giver,EmailAddress,EmailNote) ";
  qry += "values(";
  qry += "'" + req.body.Gift + "',";
  qry += "'" + req.body.Giver + "',";
  qry += "'" + req.body.EmailAddress + "',";
  qry += "'" + req.body.EmailNote + "'";
  qry += ")";
  console.log(qry);
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request().query(qry);
  }).then(result => {
    res.setHeader('Access-Control-Allow-Origin','*');
    //let rows = result.rowsAffected;
    //res.status(200).json(rows);
    res.type('text/plain');
    res.send("Rows affected: " + res.rowsAffected);
  }).catch(err => {
    res.status(500).send(err);
    sql.close();
  });
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
