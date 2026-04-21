import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify" element={<h1 className="text-center mt-10 text-white">Verify Your Email</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;