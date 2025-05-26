import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardPage from "./admin panel/dashbord";
import AddSupervisor from "./Admin Panel/pages/AddSupervisor";
import AddMember from "./Admin Panel/pages/AddMember";
import TicketManage from "./Admin Panel/pages/TicketManage";
import TicketRequest from "./Admin Panel/pages/TicketRequest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="register" element={<Register />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/dashboard" element={<DashboardPage />}></Route>
        <Route path="/supervisors" element={<AddSupervisor />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/tickets-manage" element={<TicketManage />} />
        <Route path="/tickets-request" element={<TicketRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
