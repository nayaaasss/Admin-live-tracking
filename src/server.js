// server.js
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 4000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handler(req, res));

  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Simpan lokasi user terakhir
  const userLocations = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("sendLocation", (data) => {
      console.log("Location received:", data);

      // Simpan lokasi user
      userLocations.set(socket.id, data);

      // Broadcast ke semua admin
      io.emit("receiveLocation", {
        id: socket.id,
        ...data,
      });
    });

    socket.on("disconnect", () => {
  console.log("Client disconnected:", socket.id);
  io.emit("userDisconnected", { id: socket.id }); 
});
  });

  httpServer.listen(port, () => {
    console.log(`Socket.IO Server ready at http://${hostname}:${port}`);
  });
});
