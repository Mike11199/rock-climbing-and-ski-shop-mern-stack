// import cors from 'cors'
// import rateLimiter from 'express-rate-limit'
const cors = require('cors');
// const rateLimit = require("express-rate-limit");

require("dotenv").config();
// var helmet = require('helmet')


const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const app = express();



//https://socket.io/get-started/chat
//Block below is for socket.io

//***********************SOCKET IO BLOCK ****************************************************
const { createServer } = require("http")
const { Server } = require("socket.io")
const httpServer = createServer(app)
global.io = new Server(httpServer)    //global variable

function get_random(array){
  return array[Math.floor(Math.random() * array.length)];
}

const admins = [];
let activeChats = [];

//back end connects to front end with this code, listening for this message
io.on("connection", (socket) => {
  
  //server listens for message that admin is logged in
  socket.on("admin connected with server", (adminName) => {  
    admins.push({id: socket.id, admin: adminName});
    // console.log(admins);
  })

  //server listens for a client message
  socket.on("client sends message", (msg) => {
      console.log(msg);

      if (admins.length === 0){
        socket.emit("no admin", "")
      } else {

        //server takes message received and emits to admin - all admins due to broadcast -NOT GOOD
      //   socket.broadcast.emit("server sends message from client to admin",{
      //     message: msg         
      // })
      
      let client = activeChats.find((client) => client.clientId === socket.id)
      let targetAdminId;
     
      if (client){
        targetAdminId = client.adminId
      } else {
        let admin = get_random(admins);   //so only 1-1 communication
        activeChats.push({clientId: socket.id, adminId: admin.id})
        targetAdminId = admin.id
      }

      socket.broadcast.to(targetAdminId).emit("server sends message from client to admin",{
        user: socket.id,
        message: msg         
      })      
        
      }
  })
    
  //server listens for admin message
  socket.on('admin sends message', ({user, message}) => {
    //server takes message from admin and emits back to clients
    socket.broadcast.to(user).emit("server sends message from admin to client", message)
   })

   
  //server listens for admin closes chat
  socket.on('admin closes chat', (socketId) => {
    //server takes message and broadcast to that socket
    socket.broadcast.to(socketId).emit("admin closed chat", "")
    let c = io.sockets.sockets.get(socketId)  //fix crash here?
    c.disconnect(); // reason:  server namespace disconnect
   })


   
  //server listens for admin disconnect
  socket.on("disconnect", (reason) => {
    
  //if admin disconnected remove admin from admin array
  const removeIndex = admins.findIndex((item) => item.id === socket.id);  
  if (removeIndex !== -1){
    admins.splice(removeIndex, 1)
  }   

    activeChats = activeChats.filter((item) => item.adminId !== socket.id);
    
    //if client disconnected remove client from active chats 
    const removeIndexClient = activeChats.findIndex((item) => item.clientId === socket.id);  
    if (removeIndex !== -1){
      activeChats.splice(removeIndexClient, 1)
    }   
    
    
    socket.broadcast.emit("disconnected", {reason: reason, socketId: socket.id})  //emit to all 
   })
})

//***********************SOCKET IO BLOCK END****************************************************



  //attempt to fix google log Oauth2 in breaking in prod - heroku (works localhost)
// Allow requests from the Docker container on port 3000
const corsOptions = {
  origin: 'http://localhost:3000',  // Replace with your frontend's Docker container URL
};

app.use(cors(corsOptions));


//TURN OFF FOR NOW - MIGHT BREAK SOCKET.IO
// const apiLimiter = rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000,                // more than in authRoutes for fetch requests when filtering
//     message: 'Too many requests from this IP, please try again after 15 minutes',
//   })

// app.use(apiLimiter)


// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
// }))

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

const apiRoutes = require("./routes/apiRoutes");


// mongodb connection
const connectDB = require("./config/db");
connectDB();

app.use("/api", apiRoutes);

const path = require("path");
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
    app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html")));
} else {
   app.get("/", (req,res) => {
      res.json({ message: "API running..." }); 
   }) 
}

app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
  next(error);
});


app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  } else {
    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));