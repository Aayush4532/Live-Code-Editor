import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const Option = () => {
    const [mode, setMode] = useState(0)
    const [room, setRoom] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    function randomRoomId() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789012345678901234567890123456789"
        let id = ""
        for (let i = 0; i < 8; i++) {
            id += chars[Math.floor(Math.random() * chars.length)]
        }
        setRoom(id)
    }

    function randomPassword() {
        const chars = "0123456789"
        let pass = ""
        for (let i = 0; i < 6; i++) {
            pass += chars[Math.floor(Math.random() * chars.length)]
        }
        setPassword(pass)
    }

    function reset() {
        setMode(0)
        setRoom("")
        setPassword("")
    }

    function handleCreateRoom() {
        if (!room || !password) {
            alert("Room ID aur password required hai")
            return
        }

        navigate(`/code/${room}`, {
            state: { mode: "create", password }
        })
    }

    function handleJoinroom() {
        if (!room || !password) {
            alert("Room ID aur password required hai")
            return
        }

        navigate(`/code/${room}`, {
            state: { mode: "join", password }
        })
    }

    if (mode === 0) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#020103] text-white">
                <div className="flex gap-6">
                    <button
                        onClick={() => setMode(1)}
                        className="px-6 py-3 bg-green-600 rounded hover:bg-green-700"
                    >
                        Create Room
                    </button>
                    <button
                        onClick={() => setMode(2)}
                        className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center text-white relative bg-[#020103]">
            <button
                onClick={reset}
                className="absolute top-5 right-5 text-2xl font-bold text-red-400 hover:text-red-500"
            >
                ✕
            </button>

            <div className="flex flex-col gap-5 bg-zinc-800 p-8 rounded w-[500px]">
                <h2 className="text-xl font-semibold text-center">
                    {mode === 1 ? "Create Room" : "Join Room"}
                </h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Room ID"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="flex-1 bg-zinc-200 text-black p-2 rounded"
                    />
                    {mode === 1 && (
                        <button
                            onClick={randomRoomId}
                            className="px-3 bg-gray-700 rounded"
                        >
                            Random
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder={mode === 1 ? "Set Password" : "Enter Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-zinc-200 text-black p-2 rounded"
                    />
                    {mode === 1 && (
                        <button
                            onClick={randomPassword}
                            className="px-3 bg-gray-700 rounded"
                        >
                            Random
                        </button>
                    )}
                </div>

                {mode === 1 ? (
                    <button className="mt-4 py-2 bg-green-600 rounded" onClick={handleCreateRoom}>
                        Create Room
                    </button>
                ) : (
                    <button className="mt-4 py-2 bg-blue-600 rounded" onClick={handleJoinroom}>
                        Join Room
                    </button>
                )}
            </div>
        </div>
    )
}

export default Option
