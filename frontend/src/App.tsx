import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CitizenDashboard from './pages/Citizen/CitizenDashboard';
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import HowItWorks from './pages/Public/HowItWorks';
import Departments from './pages/Public/Departments';
import FAQ from './pages/Public/FAQ';
import Contact from './pages/Public/Contact';
import TrackGrievance from './pages/Public/TrackGrievance';
import SubmitGrievance from './pages/Citizen/SubmitGrievance';
import CMODashboard from './pages/CMO/CMODashboard';
import OfficerDashboard from './pages/Officer/OfficerDashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/track" element={<TrackGrievance />} />
              <Route path="/submit" element={<SubmitGrievance />} />
              <Route path="/cmo" element={<CMODashboard />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/citizen" element={<CitizenDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
