(function() {
  var socket = io.connect('http://localhost:8000', {secure:true});
  socket.on('browser-data', data => {
    console.log(data);
  });
  socket.emit('browser-client');
})()
