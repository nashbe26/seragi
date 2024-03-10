import { User } from './api/models';
import { NextFunction, Request, Response, Router } from 'express';

const serverless = require('serverless-http'); // Netlify

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env, socketEnabled } = require('./config/vars');

const http = require('http'); // to use HTTPS, use: require('https') and the "options" with key, cert below.
// const https = require('spdy'); // for HTTP2
const fs = require('fs');
const app = require('./config/express');
const Notification = require('./api/models/notification.model');
const mongoose = require('./config/mongoose');

mongoose.connect(); // open mongoose connection

// HTTPS options
const options = {};
// const options = {
//   key: fs.readFileSync(__dirname + '/config/https/localhost-key.pem'),
//   cert: fs.readFileSync(__dirname + '/config/https/localhost.pem')
// };
const server = http.createServer(options, app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

let onlineUser: Array<any> = [];
io.on('connection', (socket: any) => {
  socket.on('disconnect', () => {
    socket.leave(socket.id);
    onlineUser.map((x) => {
      console.log(x);

      x.userSocket.map((y: any, index: any) => {
        console.log(index);

        if (y === socket.id) x.userSocket.splice(index, 1);
      });
    });

    socket.emit('onlineuser', onlineUser);
  });

  socket.on('newUser', (data: any) => {
    if (data) {
      let userId: string = data;

      let userExsit = onlineUser.find((x: any) => x.userId == userId);

      if (!userExsit) {
        let arrayTab = [];
        arrayTab.push(socket.id);
        console.log(userId);
        
        onlineUser.push({ userId, userSocket: arrayTab });
      } else {
        userExsit.userSocket.push(socket.id);
      }
    }
    
    io.emit('onlineuser', onlineUser);
  });

  socket.on('newFollow', ({ followerId, userId }: { followerId: any; userId: any }) => {
    const userSocket = onlineUser.find((user) => user.userId === userId);

    if (userSocket) {
      userSocket.userSocket.forEach((socketId: string) => {
        io.to(socketId).emit('newFollow', { followerId, userId });
      });
    }
  });

  socket.on('join', (data: any) => {
    let user = data.user;
    let conversation = data.conversation;
    console.log('join', conversation);

    socket.join(conversation);

    socket.emit('message', {
      user,
      text: `${user.name}, welcome to the chat `
    });
    socket.broadcast.to(conversation).emit('message', { user, text: `${user.name} has joined the chat!` });
  });

  socket.on('newnotif', async (data: any) => {
    console.log(data);
    
    const notification = data;

    try {
      if ( !notification.text || !notification.type) {
        throw Error('Missing Information');
      }
      const user = await User.findOne({ _id: data.id_receiver });
      if (!user) {
        throw Error('User not found');
      }
      console.log(user);

      const newNotification = new Notification({
        id_owner: data.id_owner,
        id_receiver:data.id_receiver,
        seen: false,
        text: data.text,
        type: data.type
      });
      await newNotification.save();

      const resData = data.id_receiver;
      let arrF = onlineUser.find((user) => {
        return user.userId == resData;
      });

      console.log('____', arrF);

      if (arrF) {
        arrF.userSocket.map((x: any) => {
          io.to(x).emit('getNotfi', { data: data });
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  });

  socket.on('searchUserByEmail', async (email: String) => {
    // Perform a search for the user by email (you'll need to implement this logic)
    const user = await User.findOne({ email: email });

    if (user) {
      // If user is found, emit a 'userFound' event to the client
      socket.emit('userFound', user);
    } else {
      // If user is not found, emit a 'userNotFound' event to the client
      socket.emit('userNotFound');
    }
  });
  socket.on('sendMessage', ({ message, user, discussionId }: { message: any; user: any; discussionId: string }) => {
    console.log('to : ' + discussionId);
    // io.to(discussionId).emit('message', { user, text: message });
    io.emit(discussionId, { user, text: message });
  });
});

server.listen(port, () => {
  console.info(`--- 🌟  Started (${env}) --- http://localhost:${port}`);
});

if (env === 'development') {
  // initialize test data once (admin@example.com)
  require('./api/utils/InitData');
}

/**
 * Exports express
 * @public
 */

module.exports = app;

module.exports.handler = serverless(app);
