import { Routes, Route } from "react-router-dom"
import Option from "../pages/Option"
import Code from "../pages/Code";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Option />} />
      <Route path="/code/:roomId" element={<Code />} />
    </Routes>
  )
}