import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import Dashboard from './pages/Dashboard';
import ConsumptionHistory from './pages/ConsumptionHistory';
import SpendingReport from './pages/SpendingReport';
import WelfareServices from './pages/WelfareServices';
import WelfareServiceDetail from './pages/WelfareServiceDetail';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import PeerComparison from './pages/PeerComparison';
import SpendingPrediction from './pages/SpendingPrediction';
import BudgetRecommendation from './pages/BudgetRecommendation';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/consumption" element={<ConsumptionHistory />} />
            <Route path="/reports" element={<SpendingReport />} />
            <Route path="/welfare" element={<WelfareServices />} />
            <Route path="/welfare-services" element={<WelfareServices />} />
            <Route path="/welfare-services/:id" element={<WelfareServiceDetail />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/peer-comparison" element={<PeerComparison />} />
            <Route path="/spending-prediction" element={<SpendingPrediction />} />
            <Route path="/budget-recommendation" element={<BudgetRecommendation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNavigation />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;