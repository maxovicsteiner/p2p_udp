// preload.js

const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  onReady: (cb) => ipcRenderer.on("ready", (_ev, val) => cb(val)),
  onData: (cb) => ipcRenderer.on("data", (_ev, buf) => cb(buf)),
  sendData: (buf) => ipcRenderer.send("data", buf),
});
