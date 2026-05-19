import { useEffect, useState } from "react";
import monkeyImg from "./assets/monkey.png";
import bgGif from "./assets/chae.gif";
import chae2Gif from "./assets/chae2.gif";
import { Settings } from "lucide-react";

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
};

function UserList({
  label,
  users,
  displayMode,
  setDisplayMode,
  lastFetched,
  activeGuildId,
  celebrating,
}: UserListProps) {
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
              <button
                onClick={() => {
                  const text = users
                    .map((u) => displayUser(u, displayMode))
                    .join("\n");
                  navigator.clipboard.writeText(text);
                }}
                className="text-[#949ba4] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Copy
              </button>
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
        <Button
          onClick={fetchData}
          disabled={loading}
          className="mt-1 bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
        >
          {loading ? "Grabbing..." : "Grab Reacts"}
        </Button>
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
