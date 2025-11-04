import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">Soo</h1>
        <nav className="nav">
          <Link to="/" className="nav-link">홈</Link>
          <Link to="/showcases" className="nav-link">쇼케이스</Link>
          <Link to="/matching" className="nav-link">AI 매칭</Link>
          <Link to="/about" className="nav-link">소개</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;