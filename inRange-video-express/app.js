
const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = require('express')();
const options = {
  key: fs.readFileSync(path.resolve(__dirname, './https/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './https/server.crt'))
};

app.use("/", express.static(__dirname + "/public"));

const server = https.createServer(options, app).listen(3000);
const io = require('socket.io')(server);



// app.use('/', express.static(`${ __dirname }/public`));

io.on('connection', (socket) => {
  socket.on('video', (dataURL) => {
    io.emit('video', dataURL);
  });

  socket.on('audio', (checked) => {
    io.emit('audio', checked);
  });

  socket.on('threshold', (threshold) => {
    io.emit('threshold', threshold);
  });

  socket.on('select', (color) => {
    io.emit('select', color);
  });

  socket.on('input', (param) => {
    io.emit('input', param);
  })
});

// http.listen(3000, '0.0.0.0');