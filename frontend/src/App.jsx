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
        {/* Point both routes to the Verify component */}
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;