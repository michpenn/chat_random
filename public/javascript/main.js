const socket = io();

class User {
  constructor(username) {
    this.username = username;
    this.available = true;
    this.matchedWith = [];
  }
}

updateUsers = list => {
  for (let i = 0; i < list.length; i++) {
    $(".users").append("<li><h3><b>" + list[i].username + "</b></h3></li>");
  }
};

checkForMatch = list => {
  let available;
  let unavailable;
  if (list.length < 2) {
    return false;
  } else {
    available = list.filter(user => user.available === true);
    unavailable = list.filter(user => user.available !== true);

    if (unavailable.length > 1) {
      return false;
    } else if (unavailable.length === 1) {
      console.log("hop goes here!!");
      return false;
    } else if (available.length > 1) {
      return available.slice(0, 2);
    } else {
      return false;
    }
  }
};

matchUsers = (username1, username2) => {
  socket.emit("match users", {
    username1,
    username2
  });
};

messageHasCommand = message => {
  return message.startsWith("/");
};

addMessage = messageObj => {
  $(".messages").append(
    "<li><b>" + messageObj.username + "</b>: " + messageObj.message + "</li>"
  );
};

isValidDelay = delay => {
  return String(parseInt(delay)) === delay;
};

parseMessage = messageObj => {
  const splitMessage = messageObj.message.split(" ");
  const command = splitMessage[0];
  let delay;

  switch (command) {
    case "/delay":
      delay = splitMessage[1];
      if (isValidDelay(delay) && !!messageObj.message) {
        let messageBody = splitMessage.slice(2).join(" ");
        messageObj.message = messageBody;
        setTimeout(() => addMessage(messageObj), delay);
      }
      return;
    case "/hop":
      console.log("hop!");
      addMessage(messageObj);
      return;
    default:
      addMessage(messageObj);
      return;
  }
};

$("#login-form").submit(event => {
  event.preventDefault();
  if (
    $("#username")
      .val()
      .trim() == ""
  ) {
    $(event.target).addClass("was-validated");
  } else {
    $username = $("#username").val();
    $(".login-area").hide();
    $(".chat-area").show();

    $(".messages").html("");

    socket.emit("has connected", new User($username));
  }
});

$("#message-form").submit(event => {
  event.preventDefault();

  if (
    $("#message")
      .val()
      .trim() == ""
  ) {
    $(event.target).addClass("was-validated");
  } else {
    socket.emit("new message", {
      username: $username,
      message: $("#message").val()
    });
    $("#message").val("");
    $(event.target).removeClass("was-validated");
  }
});

socket.on("has connected", data => {
  $("#users").html("");
  updateUsers(data.usersList);
  $(".messages").append(
    "<li><i><b>" + data.username + "</b> has connected</i></li>"
  );
});

socket.on("has disconnected", data => {
  $("#users").html("");
  updateUsers(data.usersList);
  $(".messages").append(
    "<li><i><b>" + data.username + "</b> has disconnected</i></li>"
  );
});

socket.on("new message", data => {
  parseMessage(data);
});

socket.on("matched", data => {
  console.log("match data: ", data);
});

socket.on("waiting", () => {
  console.log("Waiting for user...");
  $(".messages").append(
    "<li><i><b>" +
      "Waiting to connect you to the next available user!" +
      "</b></i></li>"
  );
});

socket.on("unmatched", () => {
  console.log("UM.. Waiting for user...");
  $(".messages").append(
    "<li><i><b>" +
      "Waiting to connect you to the next available user!" +
      "</b></i></li>"
  );
});

// socket.on("users are matched", data => {
//   console.log("users are matched - data: ", data);
// });
