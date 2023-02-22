import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import Login from './pages/login page/login';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route index element={<Login/>}></Route>
          <Route path='dashboard' element={<Dashboard />}></Route>
          <Route path='dashboard/:id' element={<Dashboard />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;