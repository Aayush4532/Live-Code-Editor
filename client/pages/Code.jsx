import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import Editor from "@monaco-editor/react"

export default function CodeEditor() {
  const { roomId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const wsRef = useRef(null)
  const remote = useRef(false)

  const [connected, setConnected] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const password = state?.password
  const mode = state?.mode

  useEffect(() => {
    if (!roomId || !password || !mode) {
      navigate("/")
      return
    }

    const url =
      mode === "create"
        ? `ws://localhost:8080/create?roomId=${roomId}&password=${password}`
        : `ws://localhost:8080/join?roomId=${roomId}&password=${password}`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (e) => {
      remote.current = true
      setCode(e.data)
      remote.current = false
    }

    ws.onerror = () => {
      setError("WebSocket connection failed")
    }

    ws.onclose = () => {
      setConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [])

  function handleChange(value) {
    const newCode = value || ""
    setCode(newCode)

    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      !remote.current
    ) {
      wsRef.current.send(newCode)
    }
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020103] text-red-400">
        {error}
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020103] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
          <p className="text-lg text-zinc-300">Connecting to room…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-[#020103] flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800 text-white">
        <span className="text-green-400 font-medium">
          Room: {roomId}
        </span>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-zinc-400 hover:text-red-400"
        >
          Leave
        </button>
      </div>

      <Editor
        height="calc(100vh - 48px)"
        language="javascript"
        value={code}
        theme="vs-dark"
        onChange={handleChange}
        options={{
          fontSize: 14,
          lineHeight: 22,
          fontFamily: "Fira Code, JetBrains Mono, monospace",
          fontLigatures: true,

          minimap: { enabled: false },

          lineNumbers: "on",
          renderLineHighlight: "all",

          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",

          scrollBeyondLastLine: false,
          smoothScrolling: true,

          wordWrap: "on",
          wrappingIndent: "indent",

          renderIndentGuides: true,
          guides: {
            indentation: true,
            bracketPairs: true,
          },

          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },

          padding: {
            top: 12,
            bottom: 12,
          },

          automaticLayout: true,
        }}
      />
    </div>
  )
}
