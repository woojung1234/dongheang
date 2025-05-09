import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import BottomNavigation from './components/BottomNavigation';
import Dashboard from './pages/Dashboard';
import ConsumptionHistory from './pages/ConsumptionHistory';
import SpendingReport from './pages/SpendingReport';
import WelfareServices from './pages/WelfareServices';
import WelfareServiceDetail from './pages/WelfareServiceDetail';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
// 다른 임포트들...

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consumption" element={<ConsumptionHistory />} />
          <Route path="/reports" element={<SpendingReport />} />
          {/* 복지 서비스 경로 추가/수정 */}
          <Route path="/welfare" element={<WelfareServices />} />
          <Route path="/welfare-services" element={<WelfareServices />} />
          <Route path="/welfare-services/:id" element={<WelfareServiceDetail />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* 다른 라우트들... */}
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;