/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RateTicker } from './components/RateTicker';
import LoginPage from './pages/Login';
import DashboardLayout from './pages/Dashboard';
import AboutPage from './pages/About';
import ProductsPage from './pages/Products';
import HomePage from './pages/Home';
import ContactPage from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';

const Infrastructure = () => <div className="p-20 text-center text-3xl font-black">Logistics View Coming Soon</div>;

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white flex flex-col">
          <ScrollToTop />
          <RateTicker />
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/*" element={<DashboardLayout />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
