// export {};
// const io = require("socket.io");
// let onlineUser:Array<any> = []

// exports.setup = (server: any) => {
//   io(server, {
//     cors: {
//       origin: "*",
      
//     },
//     }).on('connection', (socket: any) => {
//       socket.on('disconnect', () => {
//         socket.leave(socket.id)  
//         onlineUser.map(x=>{
//           console.log(x);
          
//           x.userSocket.map((y:any,index:any) =>{
//             console.log(index);
            
//             if(y === socket.id)
//             x.userSocket.splice(index, 1);
    
//           })
//         })
//         console.log(onlineUser);
        
//         socket.emit('onlineuser',onlineUser)
//       });        
    
//       socket.on('newUser',(data:any) =>{ 
                
//                 if(data){
//                   let userId:string =data;
                 
//                   let userExsit = onlineUser.find((x:any)=> x.userId == userId )
                  
//                   if(!userExsit){
//                     let arrayTab = [];
//                     arrayTab.push(socket.id)
//                     console.log(userId);0
//                     onlineUser.push({userId,userSocket:arrayTab})
//                   }else{
//                     userExsit.userSocket.push(socket.id)
//                   }
//                 }
                
//                 io.emit('onlineuser',onlineUser)
//             })
            
      
    
//       socket.on('join', (data: any) => {
        
//         let user = data.user;
//         let conversation = data.conversation
        
//         socket.join(conversation);
    
    
//           socket.emit('message', {
//             user,
//             text: `${user.firstName}, welcome to the chat `,
//           });
//           socket.broadcast
//             .to(conversation)
//             .emit('message', { user, text: `${user.firstName} has joined the chat!` });
     
//       });
    
//       socket.on("newnotif", async (data:any) => {
//           console.log(data,"/////////");
          
//           const resData = data.notification.email
//           let arrF = onlineUser.find((user) =>{return  user.userId == resData});
//           console.log(arrF);
          
//           if(arrF)
//           arrF.userSocket.map((x:any)=>{
//               io.to(x).emit("getNotfi",{data:data.notification});
//           })
        
    
//       });
      
//       socket.on('sendMessage', (message: any, user: any, discussionId: any, callback: any) => {
//         console.log("message.discussionId",message.discussionId);
        
//         io.to(message.discussionId).emit('message', { user, text: message }); 
    
//       });
//   });
// };


