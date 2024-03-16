import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Autorzy from "./Components/Pages/Autorzy";
import Help from "./Components/Pages/Help";
import Home from "./Components/Pages/Home";
import Hello from "./Components/Pages/Hello";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/authors" element={<Autorzy />} />
        <Route path="/" element={<Hello />} />
      </Routes>
    </>
  );
}

export default App;
