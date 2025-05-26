import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react'
import Dashboard from './frontend/admin_panel/dashbord';
import Tickets from './frontend/admin_panel/tickets';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} /> */}
      </Routes>
    </Router>
  )
}

export default App
