var app = new Vue({
el: '#app',
data: {
  message: ''
}
})

var vm = new Vue({
  data: { test: 'test-value' }
})

var socket = io.connect('http://localhost:8000', {secure:true});
socket.on('browser-data', data => {
  console.log(data);
});
socket.emit('browser-client');
