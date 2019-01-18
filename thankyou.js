var express = require('express');
var sql = require('mssql');
var bodyParser = require('body-parser');
var cors = require('cors');
var rp = require('request-promise-native');


var app = express();
// app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json({strict:false}));
app.use(cors());

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
  password: 'thankyou-editor',
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

app.get('/fme', function(req,res){
  var opts = {
    "uri": "http://SV006/fmedatastreaming/Experimental/thankyou-emails-get.fmw?opt_servicemode=sync",
    "json": true
  };
  rp(opts).then( response => {
    //console.log(response);
    let rows = response;
    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(200).json(rows);
  }).catch(error => {
    console.log(error.response);
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

// app.post('/sql', function(req,res){
//   var qry = "insert into dbo.ThankYouEmail(Gift,Giver,EmailAddress,EmailNote) ";
//   qry += "values(";
//   qry += "'" + req.body.Gift + "',";
//   qry += "'" + req.body.Giver + "',";
//   qry += "'" + req.body.EmailAddress + "',";
//   qry += "'" + req.body.EmailNote + "'";
//   qry += ")";
//   console.log(qry);
//   new sql.ConnectionPool(config).connect().then(pool => {
//     return pool.request().query(qry);
//   }).then(result => {
//     res.setHeader('Access-Control-Allow-Origin','*');
//     //let rows = result.rowsAffected;
//     //res.status(200).json(rows);
//     res.type('text/plain');
//     res.send("Rows affected: " + res.rowsAffected);
//   }).catch(err => {
//     res.status(500).send(err);
//     sql.close();
//   });
// });

app.post('/sql', function(req,res){
  data = req.body;
  console.log(data);
  console.log(data[0].Gift);
  var qry = "insert into dbo.ThankYouEmail(Gift,Giver,EmailAddress,EmailNote) ";
  qry += "values(";
  qry += "'" + data[0].Gift + "',";
  qry += "'" + data[0].Giver + "',";
  qry += "'" + data[0].EmailAddress + "',";
  qry += "'" + data[0].EmailNote + "'";
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

app.put('/fme/:id', function(req,res){
  data = req.body;
  console.log(data);
  var opts = {
    "method": "POST",
    "uri": "http://SV006/fmejobsubmitter/Experimental/thankyou-emails-put.fmw?opt_servicemode=async",
    "body":  data,
    "json": true
  };
  rp(opts).then(result => {
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

app.put('/sql/:id', function(req,res){
  console.log(req.body);
  data = req.body;
  console.log(data.ID, data.Col, data.Val);
  console.log(req.params.id);
  data.Val = data.Val.replace("'","''");
  var qry = "update dbo.ThankYouEmail set ";
  qry += data.Col + " = '" + data.Val + "' ";
  qry += "where ID = '" + req.params.id + "'";
  console.log(qry);
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request().query(qry);
  }).then(result => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.type('text/plain');
    res.send("Rows affected: " + res.rowsAffected);
  }).catch(err => {
    res.status(500).send(err);
    sql.close();
  });
});

app.delete('/sql', function(req,res){
  var qry = "delete from dbo.ThankYouEmail where ID = '" + req.body[0].ID + "'";
  new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request().query(qry);
  }).then(result => {
    res.setHeader('Access-Control-Allow-Origin','*');
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
