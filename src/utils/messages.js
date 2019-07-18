const generateMessage = (username, text) => {
  //console.log(text);
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocation = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocation
}
