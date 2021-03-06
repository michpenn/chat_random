"use strict";

const express = require("express");
const http = require("http");
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
const Socket = require("./handlers/socket");
let users = [];

server.listen(3333, () => {
  console.log("the development server is running at port 3333");
});

app.use(express.static("public"));

io.on("connection", socket => {
  const handler = new Socket(socket, io);
  let name = "";
  socket.on("has connected", user => {
    name = user.username;
    users.push(user);
    io.emit("has connected", { username: user.username, usersList: users });

    handler.findMatch();
  });

  socket.on("disconnect", () => {
    users = users.filter(user => user.username !== name);
    io.emit("has disconnected", { username: name, usersList: users });

    handler.disconnect();
  });

  socket.on("new message", data => {
    let hop = data.message.startsWith("/hop");
    if (hop && handler.matched()) return handler.hop();

    handler.message(data);
  });
});
