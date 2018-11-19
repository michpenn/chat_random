#Chat Random

The aim of this project was to create a chat application with the following functionality:

- Enable two random users to chat via text from their browser
- If there are no users available, let them know they are in line to talk to the next person who joins
- If there are two usersa vailable, pair them up to chat
- Login functionality with just a username, no need for an account
- Slash commands:
  - **/delay** - if a user types /delay 1000 hello, the message hello shoul dbe relayed to their chat partner with a delay of 1000 ms
  - **/hop** - if a user types /hop, then attempt to pair them with another available user, or wait until another user is available
- Use Node.js and ES6/ES7

## Future Features to Implement

For a future version, I would want to move the front end to React, as there is plenty of repetative code that could be broken into components

Additionally, I would like to implement testing. Due to time constraints, I did not implement that in this version.

One feature I started with but did not end up implementing was the ability to keep track of all other users that a user has already chatted with, to ensure that they are never matched to the same person.
