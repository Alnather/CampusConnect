import { useState } from "react";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(endpoint, body) {
    setLoading(true);
    setOutput(`Calling /api/auth/${endpoint}...\n`);

    try {
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      const result = {
        endpoint: `/api/auth/${endpoint}`,
        method: "POST",
        status: res.status,
        statusText: res.ok ? "SUCCESS" : "ERROR",
        requestBody: body,
        response: data,
        timestamp: new Date().toLocaleTimeString(),
      };

      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setOutput(
        JSON.stringify(
          {
            endpoint: `/api/auth/${endpoint}`,
            error: err.message,
            timestamp: new Date().toLocaleTimeString(),
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Auth API Test Page</h1>
      <p className="text-gray-600">
        Test the backend authentication APIs: signup, login, and logout
      </p>

      <div className="space-y-2">
        <input
          className="border border-gray-300 p-2 w-full rounded"
          placeholder="Name (required for signup)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border border-gray-300 p-2 w-full rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border border-gray-300 p-2 w-full rounded"
          placeholder="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => callApi("signup", { name, email, password })}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          Test Signup
        </button>

        <button
          onClick={() => callApi("login", { email, password })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Test Login
        </button>

        <button
          onClick={() => callApi("logout", {})}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          disabled={loading}
        >
          Test Logout
        </button>

        <button
          onClick={() => setOutput("")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={loading}
        >
          Clear Output
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">API Response:</h2>
        <pre className="bg-black text-green-400 p-4 rounded min-h-64 overflow-auto">
          {loading ? "Loading..." : output || "No API calls made yet. Click a button to test!"}
        </pre>
      </div>
    </div>
  );
}
