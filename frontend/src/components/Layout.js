import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer text-center py-3 mt-4 bg-light">
        <div className="container">
          <p className="mb-0 text-muted">© 2025 동행 금융 복지 도우미. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
