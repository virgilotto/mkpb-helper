import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    token: "",
    channelId: "",
    messageId: "",
    emoji: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setUsers([]);

    console.log("here");

    try {
      console.log(form);
      const result = await window.api.fetchReactions(form);
      console.log(result);

      setUsers(result);
    } catch (err) {
      setError(err?.message || String(err));
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Discord Reaction Inspector</h1>

      <input name="token" placeholder="Bot Token" onChange={handleChange} />
      <input
        name="channelId"
        placeholder="Channel ID"
        onChange={handleChange}
      />
      <input
        name="messageId"
        placeholder="Message ID"
        onChange={handleChange}
      />
      <input
        name="emoji"
        placeholder="Emoji (:fire:, 🔥, or <:name:id>)"
        onChange={handleChange}
      />

      <button onClick={fetchData} disabled={loading}>
        {loading ? "Fetching..." : "Fetch"}
      </button>

      {error && <p className="error">{error}</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.tag} ({user.id})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
