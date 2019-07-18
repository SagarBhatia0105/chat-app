const users = []

const addUser = ({id, username, room})=> {
  //Cleaning the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //Validating the data
  if(!username || !room){
    return {
      error: 'Username and room are required!'
    }
  }

  //checking for exiting user
  const existingUser = users.find((user) => {
    return user.username===username && user.room === room
  })

  //Validate username
  if(existingUser){
    return {
      error: 'Username is in use'
    }
  }

  //store users
  user = {id, username, room}
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if(index !== -1){
    return users.splice(index, 1)[0]
  }
}

const getUser = ((id) => {

  const user = users.find((usr) => usr.id === id)

  if(!user){
    return "No user with this id found"
  }
  console.log("User's room ",user.room);

  return user
})

const getUsersInRoom = ((room) => {
  return users.filter((user) => user.room === room)
})

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
