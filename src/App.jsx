import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CodeGenerator from './pages/CodeGenerator';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-16"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<CodeGenerator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  );
}

export default App;