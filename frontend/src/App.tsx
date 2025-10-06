import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TimerGame from './TimerGame';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cs" element={<TimerGame />} />
        <Route path="/it" element={<TimerGame />} />
        <Route path="/" element={<Navigate to="/cs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App