const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');


//Load Config
dotenv.config({path: './config/config.env'});

//PASSPORT CONFIG
require('./config/passport')(passport);

//Connect DB
connectDB();

const app = express();

//BODY PARSER MIDDLEWARE
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//METHOD OVERRIDE FORR PUT AND DELETE
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  }))

//ADD LOGGING WITH MORGAN
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//HANDLEBARS HELPERS
const {formatDate, stripTags, truncate, editIcon} = require('./helpers/hbs');

//HANDLEBARS
app.engine('.hbs', exphbs({helpers: {formatDate: formatDate, stripTags:stripTags, truncate: truncate, editIcon} , defaultLayout: 'main.hbs', extname: '.hbs'}));
app.set('view-engine', '.hbs');

//SESSIONS
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //STORE SESSION IN DATABASE
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}))

//PASSPORT MIDDLEWARE
app.use(passport.initialize()); 
app.use(passport.session()); 

//SET GLOBAL VARIABLE
app.use(function(req, res, next){
    res.locals.user = req.user || null;    
    next();
})

//STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories')); 

//SET PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App running on ${PORT}`);
})