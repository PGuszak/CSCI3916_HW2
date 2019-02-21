var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./authjwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

/*
router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );*/
router.route('/movies')
    .post(function (req, res) {
        console.log(req.body);
        //          no need for the below line just yet I think...
        //          res.json({success: db.save(req.body), message: "movie saved", status:200, headers: req.headers, query: req.query, env: process.env.SECRET_KEY});
        res.json({ message: "movie saved", status: 200, headers: req.headers, query: req.query, env: process.env.SECRET_KEY });
    }
    )
    .get(function (req, res) {
        /*
        wasting my time lol...
        var id = req.params.id.value; //req.swagger contains the path parameters
        if(id != null){
            var foundMov = db.find(id);
            if(foundMov) {
                res.json({status: 200, message: "GET movies", headers: req.headers, query: req.query, env: process.env.SECRET_KEY, movie: foundMov});
            }else {
                res.status(204).send();
            }
        }else{
            res.json({ status: 200, message: "GET all movies", headers: req.headers, query: req.query, env: process.env.SECRET_KEY, movie: db.find()});
        }
         */
        res.json({ message: "GET movie", status: 200, headers: req.headers, query: req.query, env: process.env.SECRET_KEY });
    }
    )
    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req);
        /*        var id = req.params.id.value;
                if(id != null){
                }
                when I realized I don't have to actually make this work yet.
                */
        res.json({ message: "movie updated", status: 200, headers: req.headers, query: req.query, env: process.env.SECRET_KEY });

    })
    .delete(function (req, res) {
        var user = db.findOne(req.body.username);

        if (!user) {
            res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            //NGL I just ripped this from below, pretty sure this is Basic Auth and I didn't see a reason to reinvent the wheel...
            if (req.body.password == user.password) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({ message: "movie deleted", status: 200, headers: req.headers, query: req.query, env: process.env.SECRET_KEY });
            }
            else {
                res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
        }
    });

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please pass username and password.' });
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({ success: true, msg: 'Successful created new user.' });
    }
});

router.post('/signin', function (req, res) {

    console.log(req.body);
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    }
    else {
        // check if password matches
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({ success: true, token: 'JWT ' + token });
        }
        else {
            res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
    };
});

router.all('*', function (req, res) {
    res.json({ error: 'Not supported HTTP method' });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);