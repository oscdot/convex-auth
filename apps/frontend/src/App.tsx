import { api, useMutation } from "backend";
import { useState } from "react";

function App() {
  const createUser = useMutation(api.user.createUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateUser = async () => {
    await createUser({
      username,
      password,
      email: "oscar@oneguylabs.com",
    });
  };

  return (
    <div>
      <h1>Opret en bruger</h1>
      <input
        type="text"
        placeholder="Brugernavn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Kodeord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleCreateUser}>Create a user</button>
    </div>
  );
}

export default App;
