const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  fetchReactions: (data) => ipcRenderer.invoke("fetch-reactions", data),
});
