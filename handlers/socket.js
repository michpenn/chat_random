"use strict";

const props = {
  userName: Symbol("username"),
  handler: Symbol("handler")
};
let nonMatched = [];
const matched = new Map();

class Socket {
  constructor(socket, io) {
    this.io = io;
    this.socket = socket;
    this.socket[props.handler] = this;
  }

  setName(name) {
    socket[props.userName] = name;
  }

  matched() {
    return matched.has(this.socket.id);
  }

  findMatch(exclude) {
    const matchedId = nonMatched.find(
      id => id != exclude && id != this.socket.id
    );
    if (matchedId) {
      matched.set(matchedId, this.socket.id);
      matched.set(this.socket.id, matchedId);
      nonMatched = nonMatched.filter(
        id => id != matchedId && id != this.socket.id
      );
      console.log(`${this.socket.id} matched against ${matchedId}`);
      this.socket.emit("matched", matchedId);
      this.io.to(matchedId).emit("matched", this.socket.id);
      this.socket[props.matched] = true;
      return;
    }
    console.log(`${this.socket.id} is alone...`);

    if (!nonMatched.includes(this.socket.id)) nonMatched.push(this.socket.id);

    this.socket.emit("waiting");
  }

  hop() {
    console.log("Hopping..");
    const unmatched = this.unmatch(false);
    this.findMatch(unmatched);
  }

  message(data) {
    this.io.to(matched.get(this.socket.id)).emit("new message", data);
    this.socket.emit("new message", data);
  }

  unmatch(addToNonMatched = true) {
    const matchedSocket = matched.get(this.socket.id);

    matched.delete(matchedSocket);
    matched.delete(this.socket.id);

    this.io.to(matchedSocket).emit("unmatched");

    if (addToNonMatched) nonMatched.push(this.socket.id);
    nonMatched.push(matchedSocket);
    console.log(`${matchedSocket} was just unmatched..`);
    return matchedSocket;
  }

  disconnect() {
    if (!this.matched())
      nonMatched = nonMatched.filter(id => this.socket.id !== id);
    else {
      const unmatched = this.unmatch(false);
      if (this.io.sockets.connected[unmatched]) {
        this.io.sockets.connected[unmatched][props.handler].findMatch(
          this.socket.id
        );
      }
    }
  }
}

module.exports = Socket;
