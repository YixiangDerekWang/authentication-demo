var express = require('express')
var app = express()
app.set('view engine', 'ejs')

// database set up
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/autho_demo_app', { useNewUrlParser: true, useUnifiedTopology: true })

var passport = require('passport')
var bodyParse = require('body-parser')
var LocalStrategy = require('passport-local')
var passportLocalMongoose = require('passport-local-mongoose')
var User = require('./models/user')

// passport set up 
app.use(require('express-session')({
  secret: 'this is a big secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParse.urlencoded({ extended: true }))

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


// ==============
// Routes
// ==============

// home page
app.get('/', (req, res) => {
  res.render('home')
})

// show register form 
app.get('/register', (req, res) => {
  res.render('register')
})

// handel user registrition
app.post('/register', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log('err')
        return res.render('register')
      }
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secret')
        console.log('registed')
      })
    }
  )
})

// render login form
app.get('/login', (req, res) => {
  res.render('login')
})

// login logic
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res) => {
})

// logout 
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/secret', isLoggedIn, (req, res) => {
  res.render('secret')
})

// standard middle ware
function isLoggedIn(req, res, next) {
  console.log('is authenticated? ' + req.isAuthenticated())
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

app.listen(3000, () => {
  console.log('server started')
})