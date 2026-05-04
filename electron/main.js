import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import * as nodeEmoji from "node-emoji";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveEmoji(input) {
  // <:name:id> or <a:name:id> — custom emoji copied from Discord
  const custom = input.match(/^<a?:(\w+):(\d+)>$/);
  if (custom) return `${custom[1]}:${custom[2]}`;

  // :fire: — standard emoji name copied from Discord
  const named = input.match(/^:(\w+):$/);
  if (named) {
    const found = nodeEmoji.find(named[1]);
    if (found) return found.emoji;
  }

  return input;
}

async function discordGet(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    const detail = err.errors ? ` — ${JSON.stringify(err.errors)}` : "";
    throw new Error(`${err.message}${detail} (HTTP ${response.status}, code ${err.code})`);
  }
  return response.json();
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(createWindow);

ipcMain.handle(
  "fetch-reactions",
  async (_, { token, channelId, messageId, emoji, guildId }) => {
    const encodedEmoji = encodeURIComponent(resolveEmoji(emoji));
    const baseUrl = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}`;

    const users = [];
    let after = null;

    while (true) {
      const url = after
        ? `${baseUrl}?limit=100&after=${after}`
        : `${baseUrl}?limit=100`;

      const batch = await discordGet(url, token);

      for (const user of batch) {
        if (!user.bot) {
          users.push({
            id: user.id,
            username: user.username,
            globalName: user.global_name ?? user.username,
            nick: null,
          });
        }
      }

      if (batch.length < 100) break;
      after = batch[batch.length - 1].id;
    }

    if (guildId) {
      const memberResults = await Promise.allSettled(
        users.map((user) =>
          discordGet(
            `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
            token
          )
        )
      );

      memberResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          users[i].nick = result.value.nick ?? null;
        }
      });
    }

    return users;
  }
);