const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//const $location = document.querySelector('#location')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
//Qs is the query string to access the arguments in the url
//ignoreQueryPrefix is to ignore the question mark in the string
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () =>{
  //new message element
  const $newMessage = $messages.lastElementChild

  //Height of the last message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible Height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

//to render the events on client side
socket.on('message', (message) => {

  //Mustache template library renders the messages to get displayed
  //on the browser
  const html = Mustache.render(messageTemplate, {
    //key: value pair
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm A")
  })

  //insertAdjacentHTML function inserts the html in div elements
  //with the option of four methods
  //beforeend, aftereend, beforebegin, afterbegin
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (url) => {
  console.log(url);

  const html = Mustache.render(locationTemplate, {
    username: url.username,
    link: url.text,
    createdAt: moment(url.createdAt).format("hh:mm A")
  })
  //console.log(url);
//target="_blank" in html opens the link in the new tab
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({room, users}) => {
  console.log(room);
  console.log(users);

  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  //disable the form
  $messageFormButton.setAttribute('disabled', 'disabled')

  //way to fecth the input property with its name when defined inside
  //a form
  var msg = e.target.elements.Message.value

  socket.emit('sendMessage', msg, (error) => {
    //enable
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if(error){
      return console.log(error);
    }

    console.log('Message delivered!');
  })
})

$sendLocationButton.addEventListener('click', () => {
  $sendLocationButton.setAttribute('disabled', 'disabled')

  //not every browser supports the geolocation API
  if(!navigator.geolocation){
    $sendLocationButton.removeAttribute('disabled')
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(positions.coords.latitude, positions.coords.longitude);
    socket.emit('sendLocation', position.coords.latitude
    , position.coords.longitude, (error) => {
      $sendLocationButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }

        console.log('Location Shared!');
    })
  })

})

socket.emit('join', {username, room}, (error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})

// socket.on('countUpdated', (count) => {
//   console.log('count has been updated!',count);
// })
//
// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked');
//   socket.emit('increment')
// })
