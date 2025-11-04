import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShowcasesPage from './pages/ShowcasesPage';
import ShowcaseDetailPage from './pages/ShowcaseDetailPage';
import BookerMatchingPage from './pages/BookerMatchingPage';
import RecommendationResultPage from './pages/RecommendationResultPage';
import PerformanceAnalysisPage from './pages/PerformanceAnalysisPage';
import MyDashboardPage from './pages/MyDashboardPage';
import AboutPage from './pages/AboutPage';
import ShowcaseBookingPage from './pages/ShowcaseBookingPage';
import SpeedDatingBookingPage from './pages/SpeedDatingBookingPage';
import ProposalFormPage from './pages/ProposalFormPage';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/showcases" element={<ShowcasesPage />} />
            <Route path="/showcase/:id" element={<ShowcaseDetailPage />} />
            <Route path="/showcase/:id/similar" element={<ShowcaseDetailPage />} />
            <Route path="/showcase/:id/booking" element={<ShowcaseBookingPage />} />
            <Route path="/showcase/:id/speed-dating" element={<SpeedDatingBookingPage />} />
            <Route path="/showcase/:id/proposal" element={<ProposalFormPage />} />
            <Route path="/matching" element={<BookerMatchingPage />} />
            <Route path="/recommendations" element={<RecommendationResultPage />} />
            <Route path="/analysis" element={<PerformanceAnalysisPage />} />
            <Route path="/dashboard" element={<MyDashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
