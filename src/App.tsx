import { useEffect, useRef, useState } from "react";
import monkeyImg from "./assets/monkey.png";
import bgGif from "./assets/chae.gif";
import chae2Gif from "./assets/chae2.gif";
import { ChevronDown, Settings } from "lucide-react";

declare global {
  interface Window {
    api: {
      fetchReactions: (form: Record<string, string>) => Promise<User[]>;
      fetchRoleMembers: (form: Record<string, string>) => Promise<User[]>;
    };
  }
}

import "./App.css";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type View = "splash" | "main";
type Tab = "reactions" | "roles";
type DisplayMode = "serverName" | "globalName" | "username" | "id";

const displayLabels: Record<DisplayMode, string> = {
  serverName: "Server nickname",
  globalName: "Display name",
  username: "Username",
  id: "User ID",
};

type User = {
  id: string;
  username: string;
  globalName: string;
  nick: string | null;
  avatar: string | null;
};

function displayUser(user: User, mode: DisplayMode): string {
  switch (mode) {
    case "serverName":
      return user.nick ?? user.globalName ?? user.username;
    case "globalName":
      return user.globalName ?? user.username;
    case "username":
      return user.username;
    case "id":
      return user.id;
  }
}

const COLUMNS = 5;
const DROPS_PER_COLUMN = 3;
const DURATION = 7;
const DIAGONAL_DELAY = (DURATION * 128) / 940;

function RainBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: COLUMNS }, (_, col) =>
        Array.from({ length: DROPS_PER_COLUMN }, (_, drop) => (
          <img
            key={`${col}-${drop}`}
            src={bgGif}
            className="absolute w-32 h-32 object-contain opacity-15"
            style={{
              left: `${(col / (COLUMNS - 1)) * 88}%`,
              animation: `shower ${DURATION}s linear infinite`,
              animationDelay: `${-DURATION * (drop / DROPS_PER_COLUMN) - col * DIAGONAL_DELAY}s`,
              willChange: "transform",
            }}
          />
        )),
      ).flat()}
    </div>
  );
}

function SplashScreen({ name, onNext }: { name: string; onNext: () => void }) {
  const [textVisible, setTextVisible] = useState(false);
  const [monkeyVisible, setMonkeyVisible] = useState(false);
  const [monkeyArrived, setMonkeyArrived] = useState(false);

  useEffect(() => {
    const showText = setTimeout(() => setTextVisible(true), 50);
    const showMonkey = setTimeout(() => setMonkeyVisible(true), 800);
    const bounceMonkey = setTimeout(() => setMonkeyArrived(true), 1700);
    return () => {
      clearTimeout(showText);
      clearTimeout(showMonkey);
      clearTimeout(bounceMonkey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1f22] flex flex-col items-center justify-center gap-12 overflow-hidden">
      <h1
        className="text-6xl font-bold text-white tracking-tight transition-opacity duration-700"
        style={{ opacity: textVisible ? 1 : 0 }}
      >
        Welcome, {name}
      </h1>
      <button
        onClick={onNext}
        className="cursor-pointer border-none bg-transparent p-0"
        style={{
          transform: monkeyVisible ? "translateY(0)" : "translateY(100vh)",
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <img
          src={monkeyImg}
          alt="Enter"
          className={`monkey-spin w-36 h-36 object-contain${monkeyArrived ? " monkey-bounce" : ""}`}
        />
      </button>
    </div>
  );
}

type UserListProps = {
  label: string;
  users: User[];
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  lastFetched: Date | null;
  activeGuildId: string;
  celebrating: boolean;
  showExport?: boolean;
};

function UserList({
  label,
  users,
  displayMode,
  setDisplayMode,
  lastFetched,
  activeGuildId,
  celebrating,
  showExport,
}: UserListProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyList = () => {
    const text = users.map((u) => displayUser(u, displayMode)).join("\n");
    navigator.clipboard.writeText(text);
    setMenuOpen(false);
  };

  const exportForHG = () => {
    const PLACEHOLDER = "https://cdn.discordapp.com/embed/avatars/0.png";

    const avatarUrl = (user: User) =>
      user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : PLACEHOLDER;
    const PER_DISTRICT = 4;
    const lines: string[] = [
      "MKPB Hunger Games",
      "https://cdn.discordapp.com/banners/1475012785397039134/7077a57fd04209f8485873a0823d1ebb.png",
      "",
      "",
    ];

    for (let d = 0; d < Math.ceil(users.length / PER_DISTRICT); d++) {
      const slice = users.slice(d * PER_DISTRICT, (d + 1) * PER_DISTRICT);
      lines.push(`District ${d + 1}`, "#FFFFFF 0 0", "");
      slice.forEach((user, i) => {
        lines.push(
          user.nick ?? user.globalName ?? user.username,
          user.globalName ?? user.username,
          "4",
          avatarUrl(user),
          "BW",
          "",
        );
        if (i === slice.length - 1) lines.push(""); // extra blank line after last player to trigger new district
      });
    }

    while (lines.at(-1) === "") lines.pop();

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hg-cast.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      {celebrating && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="text-white text-sm font-semibold tracking-wide">
            Cooking Results...
          </span>
          <div className="w-64 rounded-xl overflow-hidden shadow-xl">
            <img src={chae2Gif} alt="" className="w-full object-cover" />
          </div>
        </div>
      )}

      {!celebrating && users.length > 0 && (
        <div className="mt-4 bg-[#2b2d31] rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e1f22] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-white font-medium text-sm">{label}</span>
              <Badge className="bg-[#5865f2] text-white text-xs">
                {users.length}
              </Badge>
              {lastFetched && (
                <span className="text-[#6d6f78] text-xs">
                  {lastFetched.toLocaleTimeString()}
                </span>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="text-[#949ba4] hover:text-white transition-colors cursor-pointer p-1 rounded"
                >
                  <ChevronDown size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute left-0 top-6 bg-[#1e1f22] border border-[#3f4147] rounded-lg shadow-xl z-20 py-1 min-w-36">
                    <button
                      onClick={copyList}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#dbdee1] hover:bg-[#35373c] transition-colors cursor-pointer"
                    >
                      Copy list
                    </button>
                    {showExport && (
                      <button
                        onClick={() => {
                          exportForHG();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#dbdee1] hover:bg-[#35373c] transition-colors cursor-pointer"
                      >
                        Export for HG
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Select
              value={displayMode}
              onValueChange={(v) => setDisplayMode(v as DisplayMode)}
            >
              <SelectTrigger className="h-7 w-44 bg-[#1e1f22] border-transparent text-[#949ba4] text-xs focus:ring-0">
                <SelectValue>{displayLabels[displayMode]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1e1f22] border-[#3f4147] text-[#dbdee1]">
                {activeGuildId && (
                  <SelectItem value="serverName">Server nickname</SelectItem>
                )}
                <SelectItem value="globalName">Display name</SelectItem>
                <SelectItem value="username">Username</SelectItem>
                <SelectItem value="id">User ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ul className="divide-y divide-[#1e1f22] max-h-80 overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.id}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-[#35373c] transition-colors"
              >
                <span className="text-[#dbdee1] text-sm font-medium">
                  {displayUser(user, displayMode)}
                </span>
                {displayMode !== "id" && (
                  <span className="text-[#6d6f78] text-xs font-mono">
                    {user.id}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function ReactionsTab({ token, guildId }: { token: string; guildId: string }) {
  const [form, setForm] = useState({
    channelId: localStorage.getItem("channelId") ?? "",
    messageId: "",
    emoji: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("username");
  const [activeGuildId, setActiveGuildId] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "channelId")
      localStorage.setItem("channelId", e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setUsers([]);
    setCelebrating(false);
    document.title = "Grabbing reacts...";

    try {
      const result = await window.api.fetchReactions({
        ...form,
        token,
        guildId,
      });
      setUsers(result);
      setActiveGuildId(guildId);
      setDisplayMode(guildId ? "serverName" : "username");
      setLastFetched(new Date());
      if (result.length > 0) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
    document.title = "MKPB Helper";
  };

  return (
    <div>
      <div className="bg-[#2b2d31] rounded-xl p-6 flex flex-col gap-3 shadow-xl">
        <Input
          name="channelId"
          placeholder="Channel/Thread ID"
          value={form.channelId}
          onChange={handleChange}
          className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
        />
        <Input
          name="messageId"
          placeholder="Message ID"
          onChange={handleChange}
          className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
        />
        <Input
          name="emoji"
          placeholder="Emoji (:fire:, 🔥, or <:name:id>)"
          onChange={handleChange}
          className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
        />
        <div className="flex gap-2 mt-1">
          <Button
            onClick={fetchData}
            disabled={loading}
            className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
          >
            {loading ? "Grabbing..." : "Grab Reacts"}
          </Button>
          {false && (
            <Button
              onClick={() => {
                const firstNames = [
                  "Alice",
                  "Bob",
                  "Charlie",
                  "Diana",
                  "Eve",
                  "Frank",
                  "Grace",
                  "Henry",
                  "Iris",
                  "Jack",
                  "Karen",
                  "Leo",
                  "Mia",
                  "Noah",
                  "Olivia",
                  "Paul",
                  "Quinn",
                  "Rose",
                  "Sam",
                  "Tina",
                  "Uma",
                  "Victor",
                  "Wendy",
                  "Xander",
                  "Yara",
                  "Zoe",
                  "Ash",
                  "Blake",
                  "Casey",
                  "Drew",
                  "Ellis",
                  "Finn",
                  "Gray",
                  "Harper",
                  "Indie",
                  "Jules",
                  "Kai",
                  "Lane",
                  "Morgan",
                  "Noel",
                ];
                const nicks = [
                  "monkey king",
                  "chaewon fan",
                  "kpop lord",
                  "roblox god",
                  "server mod",
                  "discord gremlin",
                  "the og",
                  "big brain",
                  "vibe check",
                  "night owl",
                  "gamer mode",
                  "lurker",
                  "chaos agent",
                  "main character",
                  "local menace",
                  "certified nerd",
                  "touch grass",
                  "no sleep",
                  "based",
                  "certified",
                  "gigachad",
                  "the real one",
                  "legend",
                  "goat",
                  "clutch",
                  "lowkey",
                  "highkey",
                  "unhinged",
                  "verified",
                  "slay",
                ];
                const mock: User[] = Array.from({ length: 200 }, (_, i) => ({
                  id: `10000000000000${String(i).padStart(4, "0")}`,
                  username: `user_${i + 1}`,
                  globalName:
                    firstNames[i % firstNames.length] +
                    (i >= firstNames.length
                      ? ` ${Math.floor(i / firstNames.length) + 1}`
                      : ""),
                  nick: i % 3 === 0 ? nicks[i % nicks.length] : null,
                  avatar: null,
                }));
                setUsers(mock);
                setActiveGuildId("mock");
                setDisplayMode("serverName");
                setLastFetched(new Date());
              }}
              className="bg-[#35373c] hover:bg-[#3f4147] text-[#949ba4] text-xs cursor-pointer px-3"
            >
              Mock
            </Button>
          )}
        </div>
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
      </div>
      <UserList
        label="Reactors"
        users={users}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        lastFetched={lastFetched}
        activeGuildId={activeGuildId}
        celebrating={celebrating}
        showExport
      />
    </div>
  );
}

function RoleTab({ token, guildId }: { token: string; guildId: string }) {
  const [roleId, setRoleId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("serverName");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setUsers([]);
    setCelebrating(false);
    document.title = "Grabbing members...";

    try {
      const result = await window.api.fetchRoleMembers({
        token,
        guildId,
        roleId,
      });
      setUsers(result);
      setDisplayMode(guildId ? "serverName" : "username");
      setLastFetched(new Date());
      if (result.length > 0) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
    document.title = "MKPB Helper";
  };

  return (
    <div>
      <div className="bg-[#2b2d31] rounded-xl p-6 flex flex-col gap-3 shadow-xl">
        <Input
          placeholder="Role ID"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
        />
        <Button
          onClick={fetchData}
          disabled={loading || !guildId}
          className="mt-1 bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
        >
          {loading ? "Grabbing..." : "Grab Members"}
        </Button>
        {!guildId && (
          <p className="text-yellow-400 text-sm bg-yellow-400/10 rounded-lg px-4 py-2.5">
            Server ID is required — set it in Settings (cog icon).
          </p>
        )}
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}
      </div>
      <UserList
        label="Members"
        users={users}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        lastFetched={lastFetched}
        activeGuildId={guildId}
        celebrating={celebrating}
      />
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("reactions");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    token: localStorage.getItem("token") ?? "",
    guildId: localStorage.getItem("guildId") ?? "",
  });

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem(e.target.name, e.target.value);
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (view === "splash")
    return <SplashScreen name="Drew" onNext={() => setView("main")} />;

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-6">
      <RainBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MKPB Helper
            </h1>
            <p className="text-[#949ba4] text-sm mt-0.5">Discord tools</p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-[#949ba4] hover:text-white transition-colors cursor-pointer p-2 rounded-lg hover:bg-[#2b2d31]"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="flex gap-1 bg-[#1e1f22] rounded-lg p-1 mb-4">
          {(["reactions", "roles"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-[#2b2d31] text-white font-medium"
                  : "text-[#949ba4] hover:text-white"
              }`}
            >
              {tab === "reactions" ? "Reactions" : "Role Members"}
            </button>
          ))}
        </div>

        {activeTab === "reactions" && (
          <ReactionsTab token={settings.token} guildId={settings.guildId} />
        )}
        {activeTab === "roles" && (
          <RoleTab token={settings.token} guildId={settings.guildId} />
        )}
      </div>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-[#2b2d31] rounded-xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-base">Settings</h2>
            <Input
              name="token"
              type="password"
              placeholder="Bot Token"
              value={settings.token}
              onChange={handleSettingsChange}
              className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
            />
            <Input
              name="guildId"
              placeholder="Server ID"
              value={settings.guildId}
              onChange={handleSettingsChange}
              className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
            />
            <Button
              onClick={() => setSettingsOpen(false)}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
