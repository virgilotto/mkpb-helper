import { useEffect, useState } from "react";
import monkeyImg from "./assets/monkey.png";
import bgGif from "./assets/chae.gif";

declare global {
  interface Window {
    api: {
      fetchReactions: (form: Record<string, string>) => Promise<User[]>;
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

type View = "name" | "splash" | "main";
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
// time for one gif-height (128px) to travel the full path (≈100vh + 240px, assuming ~700px viewport)
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

  useEffect(() => {
    const showText = setTimeout(() => setTextVisible(true), 50);
    const showMonkey = setTimeout(() => setMonkeyVisible(true), 800);
    return () => {
      clearTimeout(showText);
      clearTimeout(showMonkey);
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
          className="monkey-spin w-36 h-36 object-contain"
        />
      </button>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>("splash");

  const [form, setForm] = useState({
    token: "",
    channelId: "",
    messageId: "",
    emoji: "",
    guildId: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("username");
  const [activeGuildId, setActiveGuildId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setUsers([]);

    try {
      const result = await window.api.fetchReactions(form);
      setUsers(result);
      setActiveGuildId(form.guildId);
      setDisplayMode(form.guildId ? "serverName" : "username");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
  };

  if (view === "splash")
    return <SplashScreen name="Drew" onNext={() => setView("main")} />;

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-6">
      <RainBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Reaction Inspector
          </h1>
          <p className="text-[#949ba4] text-sm mt-1">
            Fetch who reacted to a Discord message
          </p>
        </div>

        <div className="bg-[#2b2d31] rounded-xl p-6 flex flex-col gap-3 shadow-xl">
          <Input
            name="token"
            type="password"
            placeholder="Bot Token"
            onChange={handleChange}
            className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
          />
          <Input
            name="channelId"
            placeholder="Channel ID"
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
          <Input
            name="guildId"
            placeholder="Server ID (optional — for server nicknames)"
            onChange={handleChange}
            className="bg-[#1e1f22] text-white placeholder-[#6d6f78] border-transparent focus-visible:border-[#5865f2] focus-visible:ring-0"
          />

          <Button
            onClick={fetchData}
            disabled={loading}
            className="mt-1 bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer"
          >
            {loading ? "Fetching..." : "Fetch Reactions"}
          </Button>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        {users.length > 0 && (
          <div className="mt-4 bg-[#2b2d31] rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e1f22] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white font-medium text-sm">Reactors</span>
                <Badge className="bg-[#5865f2] text-white text-xs">
                  {users.length}
                </Badge>
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
      </div>
    </div>
  );
}

export default App;
