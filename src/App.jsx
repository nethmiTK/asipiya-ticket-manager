import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './frontend/pages/Home'
import Register from './frontend/pages/Register'
import Login from './frontend/pages/Login'
import DashboardPage from './frontend/admin panel/dashbord';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='register' element={<Register />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/dashboard' element={<DashboardPage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
