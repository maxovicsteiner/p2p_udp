// main.js

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const dgram = require("node:dgram");

const socket = dgram.createSocket("udp4");

let peer = undefined;

const server = {
  address: "127.0.0.1",
  port: 5000,
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../renderer/preload.js"),
    },
  });

  mainWindow.loadFile("./src/renderer/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow;
};

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // initialize connection with signaling server
  socket.send("0", server.port, server.address);

  socket.on("message", (msg, rinfo) => {
    if (rinfo.address === server.address && rinfo.port === server.port) {
      peer = msg.toString();
      peer = {
        addr: peer.split(":")[0],
        port: parseInt(peer.split(":")[1]),
      };
      console.log(`Sending to ${peer.addr}:${peer.port}`);
      socket.send("hole punch", peer.port, peer.addr);
      mainWindow.webContents.send("ready", 1);
    } else {
      mainWindow.webContents.send("data", msg.toString());
    }
  });

  ipcMain.on("data", (_ev, buf) => {
    socket.send(buf, peer.port, peer.addr, (err, bytes) => {
      if (err) {
        console.log(err.message);
      }
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
