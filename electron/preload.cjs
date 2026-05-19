const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  fetchReactions: (data) => ipcRenderer.invoke("fetch-reactions", data),
  fetchRoleMembers: (data) => ipcRenderer.invoke("fetch-role-members", data),
});
