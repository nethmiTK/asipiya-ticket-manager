import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react'
import Dashboard from './frontend/admin_panel/dashbord';
import Tickets from './frontend/admin_panel/tickets';

import './App.css'
import AddSupervisor from './frontend/admin_panel/AddSupervisor';
import AddMember from './frontend/admin_panel/AddMember';
import TicketManage from './frontend/admin_panel/TicketManage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} /> */}
        {/*<Route path="/supervisor" element={<AddSupervisor />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/ticket-manage" element={<TicketManage />} />*/}
      </Routes>
    </Router>
  )
}

export default App
