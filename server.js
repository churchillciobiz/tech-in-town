var express = require('express');
const http = require('http');
const path = require('path');

// Mongoose import
var mongoose = require('mongoose');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Multipart/form-data");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));
const port = 1999;

// Mongoose connection to MongoDB locally, change this if you want to run it in MLab, Atlas etc
mongoose.connect('mongodb://127.0.0.1:27017/heroku_stuff', { useNewUrlParser: true }, function (error) {
    if (error) {
        console.log(error);
    }
});


//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.static(path.join(__dirname, "public")));
// Mongoose Schema definition
var Schema = mongoose.Schema;
var JsonSchema = new Schema({
    name: String,
    type: Schema.Types.Mixed
});


 
// Mongoose Model definition
var Json = mongoose.model('JString', JsonSchema, 'maplocations');

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET json data. */
app.get('/mapjson/:name', function (req, res) {
  console.log(req.params.name)
    if (req.params.name) {
        Json.findOne({ "Name": req.params.name },{}, function (err, docs) {
            res.json(docs);
        });
    }
});

/* GET json data. */
app.get('/mapjsonall', function (req, res) {
      Json.find({},{}, function (err, docs) {
          res.json(docs);
      });
});

app.get('/mapjsonwithin', function (req, res) {
      var lat1 = parseFloat(req.query.lat1);
      var lon1 = parseFloat(req.query.lon1);
      var lat2 = parseFloat(req.query.lat2);
      var lon2 = parseFloat(req.query.lon2);
      Json.find({"pos" : { $geoWithin : { $box: [[lon2,lat2], [lon1,lat1]]}}},{}, function (err, docs) {
        console.log(docs);
          res.json(docs);
      });
});

app.get('/mapjsonallnear', function (req, res) {
      var lat = parseFloat(req.query.lat);
      var lon = parseFloat(req.query.lon);
      Json.find({"pos" : {$near: [lon,lat]}},{}, function (err, docs) {
          res.json(docs);
      });
});

/* GET layers json data. */
app.get('/maplayers', function (req, res) {
    Json.find({},{'name': 1}, function (err, docs) {
        res.json(docs);
    });
});

/* GET Map page. */
app.get('/map', function(req,res) {
    Json.find({},{}, function(e,docs){
        console.log(docs);
        res.render('map', {
            "jmap" : docs,
            lat : 40.78854,
            lng : -1.28639
        });
    });
});

app.listen(port, () => console.log(`UPLOAD SERVER started on port ${port}!`))
