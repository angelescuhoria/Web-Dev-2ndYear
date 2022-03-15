const express = require('express'); // load node modules
const ejs = require('ejs');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const math = require('math');
const { Client } = require("pg");
var app = express(); // initialise

app.use(express.static('Page_1')); // render
app.use('/Page_1',express.static('Page_1'));
app.set('view engine', 'ejs'); // view engine -> ejs


function verificaImagini()
{
    var textFisier=fs.readFileSync("Page_1/json/galerie.json")
    var jsi=JSON.parse(textFisier);

    var caleGalerie=jsi.cale_galerie;
    let vectImagini=[]
    var today = new Date();
    var time = today.getMinutes();
    var exact = math.floor((time / 15) + 1);
    for (let im of jsi.images)
  {
        var quarter = im.sfert_ora;
        var imVeche = path.join(caleGalerie,im.cale_imagine);
        var ext = path.extname(im.cale_imagine);
        var numeFisier = path.basename(im.cale_imagine,ext)
        vectImagini.push({mare: imVeche, titlu:im.titlu, time: exact, quarter: quarter});
    }
        return vectImagini;
}

// Get routes (display pages)
app.get(['/', '/index'], function(req, res) {
  var load = verificaImagini();
  res.render('Pages/index', {imagini: load, ip: req.ip});
});

app.get('/Views/Pages/whoarewe', function(req, res) {
  var load = verificaImagini();
  res.render('Pages/whoarewe', {imagini: load});
});

app.get('*/galerie.json',function(req,res) {
        res.status(403).render(__dirname+"/views/Pages/403");
      }
);

const client = new Client({
    host: "localhost",
    user: "horia",
    password: "horia",
    database: "ProiectTW",
    port: 5432
});
client.connect();
app.get('/Views/Pages/Foods', function(req, res) {
    client.query("select id_food, name, image, food_order, price from food", function (err, rez) {
      res.render("Pages/Foods", {foods:rez.rows});
    });
});

app.get("/Views/Pages/Item/:id_food",function(req, res){

    const rezultat = client.query("select * from food where id_food="+req.params.id_food, function(err,rez){
        console.log(rez.rows);
        res.render("Pages/Item", {prod:rez.rows[0]});
    });
});

app.get('/*', function(req, res) {
  res.render('Pages' + req.url, function(err, RezRender) {
    if(err) {
      if (err.message.includes('Failed to lookup view')) {
        res.status(404).render(__dirname + '/views/Pages/404');
      }
      else throw err;
    }
    else res.render(RezRender);
  });
});
verificaImagini();


app.listen(8080); //port
