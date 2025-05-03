import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 스타일
import './App.css';

// 페이지 컴포넌트
import Home from './pages/Home';
import ConsumptionHistory from './pages/ConsumptionHistory';
import WelfareServices from './pages/WelfareServices';
import SpendingReport from './pages/SpendingReport';
import PeerComparison from './pages/PeerComparison';
import SpendingPrediction from './pages/SpendingPrediction';
import BudgetRecommendation from './pages/BudgetRecommendation';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// 컨텍스트
import { AuthProvider } from './context/AuthContext';

function App() {
  const [loading, setLoading] = useState(true);
  
  // API 서버 연결 테스트
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('API 서버 연결 테스트 중...');
        const response = await axios.get('/api');
        console.log('API 서버 응답:', response.data);
        setLoading(false);
      } catch (error) {
        console.error('API 서버 연결 오류:', error);
        setLoading(false);
      }
    };
    
    testApiConnection();
  }, []);
  
  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consumption" element={<ConsumptionHistory />} />
            <Route path="/welfare" element={<WelfareServices />} />
            <Route path="/report" element={<SpendingReport />} />
            <Route path="/comparison" element={<PeerComparison />} />
            <Route path="/prediction" element={<SpendingPrediction />} />
            <Route path="/budget" element={<BudgetRecommendation />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
