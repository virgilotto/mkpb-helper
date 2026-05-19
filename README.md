# MKPB Helper

A desktop app with two tools:
- **Reactions** — fetch everyone who reacted to a Discord message with a specific emoji
- **Role Members** — fetch everyone in a server who has a specific role

---

## Installation

- **Windows:** run the `.exe` installer, or use the portable `.exe` directly (no install needed)
- **Mac:** open the `.dmg`, drag the app to Applications (or just double-click it from the DMG)

---

## Before You Start

You'll need two things set up in Discord:

**1. Developer Mode** — this lets you copy IDs from Discord.
Go to **User Settings → Advanced → Developer Mode** and turn it on.
Then you can right click anything (server, channel, messages) and copy the needed IDs.

**2. A bot token** — the app uses a Discord bot to read reactions. You should already have this. It looks something like `MTExODk1...` and goes in the Bot Token field. It's saved automatically so you only need to paste it once.
If not:
- go to Discord Developer Portal
- Applications -> New Application -> Give it a name, icon, etc.
- OAuth2 -> OAuth2 URL Generator (select "bot") -> Give permisisons (mostly read, so the bot can get access to messages/reacts, like "View Channels", "Read Message History" - these should be mandatory and enough) -> Copy the Generated URL below and invite it to the server
- Bot -> Reset Token -> Get your token (this is crucial for everything to work)

---

## How to Use

Bot Token and Server ID live in **Settings** (the cog icon ⚙️ in the top-right corner). These are saved automatically and rarely need changing.

### Reactions tab

Fill in the fields and hit **Grab Reacts**.

| Field | What to put |
|---|---|
| **Channel ID** | Right-click the channel in Discord → Copy Channel ID |
| **Message ID** | Right-click the message → Copy Message ID |
| **Emoji** | Paste the emoji directly (🔥), or type `:fire:`, or copy a custom emoji from Discord (it'll look like `<:name:12345>`) |

### Role Members tab

Fill in the Role ID and hit **Grab Members**.

| Field | What to put |
|---|---|
| **Role ID** | Right-click the role in Server Settings → Copy Role ID |

> Server ID must be set in Settings for this tab to work.

---

## Results

Once fetched, a list of users appears below the form.

**Display options** — use the dropdown to switch how names are shown:
- **Server nickname** — the name the person set specifically for your server *(only available if Server ID is set)*
- **Display name** — their global Discord display name
- **Username** — their unique Discord username (e.g. `cooluser123`)
- **User ID** — their numeric Discord ID

**Copy** — click the Copy button next to the count to copy the full list to your clipboard, one name per line. Paste it directly into [Wheel of Names](https://wheelofnames.com) or anywhere else.

**Last fetched time** — shown next to the count so you know how fresh the data is.

---

## Troubleshooting

### "Missing Access" error when fetching role members

The bot needs the **Server Members Intent** enabled to list server members. To fix it:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application → **Bot**
3. Scroll to **Privileged Gateway Intents**
4. Enable **Server Members Intent**
5. Save

---

### Mac says the app is damaged or from an unidentified developer

This is a standard macOS warning for apps that aren't signed with an Apple certificate — the app is fine, macOS is just being cautious.

When the warning appears, don't click Move to Trash. Instead:

1. Go to **System Settings → Privacy & Security**
2. Scroll down until you see a message about MKPB Helper being blocked
3. Click **Open Anyway**
4. Confirm on the prompt that appears

The warning only appears the first time — after that the app opens normally.

---

## Notes

- The app filters out bots automatically — only real users appear in the list
- **Bot Token**, **Channel ID**, and **Server ID** are saved between sessions so you don't have to re-enter them every time
- **Message ID** and **Emoji** are intentionally not saved since those change every time
- If you get an error like *"Missing Access"*, the bot likely doesn't have permission to read that channel
