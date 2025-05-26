import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import UserDashboard from "./frontend/Users Panel/UserDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
