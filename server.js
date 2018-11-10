const express = require('express')
const app = express()
// helps look what is being sent by the client
const bodyParser = require('body-parser')
//if I want to talk to my database
const MongoClient = require('mongodb').MongoClient

var db

// this app is using this database
MongoClient.connect('mongodb://bootcamp:bootcamp2018@ds157223.mlab.com:57223/velp', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000')
  })
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// our html, css etc dont need ind routes, they use this
app.use(express.static('public'))

app.get('/', (req, res) => {
  // array of objects
  db.collection('messages').find().toArray((err, result) => {
    console.log(result)
    if (err) return console.log(err)
    // render and pass in message and result,  wherever i see messages, its just objects
    // ejs spits out html, html sent out
    // passing an object to ejs template, messages is a property, you create word in messages
    // messages or whatever gets sent to the ejs and called by ejs
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  // save method that comes with mongo
  // body parser helps the {} lin to work
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    // triggers to the root
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/messagesDown', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbDown:req.body.thumbDown + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

//just like an event listener
app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
