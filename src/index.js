//start from chapter 11
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
//destructuring
const {generateMessage, generateLocation} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const app = express()

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
//express creates the http server behind the scene
//that is why the refactoring was don to explicitly fetch it
const server = http.createServer(app)

//socketio function requires explicit http server as its
//argument
const io = socketio(server)

app.use(express.static(publicDirectoryPath))

//for the connection event when the client connects

let count = 0

//socket argument is an object and contains info w.r.t the client
//the following function works x times if there are
//x different connections
io.on('connection', (socket) => {
  console.log('New Websocket connection');

  socket.on('join', (options, callback) => {
    //emits the message to everyone except the current user
    //socket.broadcast.emit('message', generateMessage('A new user has joined'))

    //... is the ES6 spread operator
    const {error, user} = addUser({id: socket.id, ...options})

    if(error){
      return callback(error)
    }

    //join allows us to join the specified chat room
    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', `Welcome! ${user.username}`))

    //emits the message to everyone except the current user
    //in the specified room
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username}
      has joined ${user.room}`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

      callback()

  })

  socket.on('sendMessage', (msg, callback) => {
    filter = new Filter()

    const user = getUser(socket.id)

    if(filter.isProfane(msg)){
      return callback('Profanity is not allowed!')
    }

    io.to(user.room).emit('message', generateMessage(user.username, msg))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on('sendLocation', (latitude, longitude, callback) => {

    const user = getUser(socket.id)

    if(!latitude && !longitude){
      return callback('No coordinates received!')
    }

    io.to(user.room).emit('locationMessage',
            generateLocation(user.username, `https://www.google.com/maps?q=${latitude},${longitude}`))
    callback()
  })
  //emits the events
  // socket.emit('countUpdated',count)
  //
  //the following emits on every single connection
  //   io.emit('countUpdated', count)
  // })
})

server.listen(port, () => {
  //ES6 syntax
  console.log(`Server is up on port ${port}`);
})
