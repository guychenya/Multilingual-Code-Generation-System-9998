import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCode, FiZap, FiCpu, FiLayers, FiArrowRight } = FiIcons;

const Home = () => {
  const features = [
    {
      icon: FiCode,
      title: 'Multi-Language Support',
      description: 'Generate code in Python, JavaScript, Java, C++, and 20+ other languages'
    },
    {
      icon: FiZap,
      title: 'AI-Powered',
      description: 'Advanced language models understand context and generate high-quality code'
    },
    {
      icon: FiCpu,
      title: 'Smart Processing',
      description: 'Intelligent code analysis and optimization for better performance'
    },
    {
      icon: FiLayers,
      title: 'Full-Stack Ready',
      description: 'Generate frontend, backend, and database code with proper architecture'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-6xl font-bold text-white mb-6">
          AI Code
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {' '}Generator
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Transform your ideas into production-ready code across multiple programming languages 
          with the power of artificial intelligence.
        </p>
        
        <Link to="/generator">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 mx-auto mb-16"
          >
            <span>Start Generating</span>
            <SafeIcon icon={FiArrowRight} />
          </motion.button>
        </Link>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 hover:bg-white/10 transition-all duration-300"
          >
            <SafeIcon icon={feature.icon} className="text-purple-400 text-3xl mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;