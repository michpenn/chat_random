const express = require("express");
const http = require("http");
const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
let users = [];

server.listen(3333, () => {
  console.log("the development server is running at port 3333");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/styles/index.css", (req, res) => {
  res.sendFile(__dirname + "/styles/index.css");
});

app.get("/javascript/main.js", (req, res) => {
  res.sendFile(__dirname + "/javascript/main.js");
});

io.on("connection", socket => {
  let name = "";
  socket.on("has connected", user => {
    name = user.username;
    users.push(user);
    io.emit("has connected", { username: user.username, usersList: users });

    if (users.length === 2) {
      users.map(user => {
        user.available = false;
      });
      console.log("users: ", users);
      io.emit("match", { usersList: users });
    }
  });

  socket.on("disconnect", () => {
    users = users.filter(user => user.username !== name);
    io.emit("has disconnected", { username: name, usersList: users });
  });

  socket.on("new message", data => {
    let matchedUser = users.find(user => {
      return user.username === data.username && !user.available;
    });
    let hop = data.message.startsWith("/hop");
    console.log("data - message: ", data.message);
    if (matchedUser && hop) {
      //unmatch the other person who is matched
      //check who is available & hasnt been matched
      //match them
      io.emit("new message", data);
    } else {
      io.emit("new message", data);
    }
  });

  // socket.on("match users", data => {
  //   // console.log("users are matched: ", data);
  //   //find user 1 & user 2 in users, make unavailable, add other username to previous match
  //   users.find(user => user.username == data.username1).available = false;
  //   users
  //     .find(user => user.username == data.username1)
  //     .matchedWith.push(data.username2);
  //   users.find(user => user.username == data.username2).available = false;
  //   users
  //     .find(user => user.username == data.username2)
  //     .matchedWith.push(data.username1);
  //   //console.log("users are matched: ", data, users);
  //   io.emit("users are matched", { userList: users });
  // });
});
