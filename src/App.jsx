import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
//import Sidebar from './components/Sidebar';
import AddSupervisor from './pages/AddSupervisor';
import AddMember from './pages/AddMember';
import Tickets from './pages/Tickets';
import TicketManage from './pages/TicketManage';
import TicketRequest from './pages/TicketRequest';

const App = () => {
  return (
    <Router>
      {/*<Sidebar/> */}
      <div className="max-w-7xl mx-auto flex pt-4">
        <div className="flex-1 p-40 pt-4 ">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/supervisors" element={<AddSupervisor />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets-manage" element={<TicketManage />} />
            <Route path="/tickets-request" element={<TicketRequest />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

