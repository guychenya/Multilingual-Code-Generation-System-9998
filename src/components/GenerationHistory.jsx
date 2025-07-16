import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const { FiClock, FiCode, FiEye } = FiIcons;

const GenerationHistory = ({ history, onSelect }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 shadow-xl">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
        <SafeIcon icon={FiClock} />
        <span>Recent Generations</span>
      </h3>
      
      {history.length === 0 ? (
        <div className="text-center py-8">
          <SafeIcon icon={FiCode} className="text-gray-400 text-4xl mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No generations yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-black/20 border border-purple-500/20 rounded-lg p-3 hover:bg-black/30 transition-colors cursor-pointer group"
              onClick={() => onSelect(entry)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {entry.language}
                </span>
                <SafeIcon icon={FiEye} className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                {entry.prompt}
              </p>
              <p className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerationHistory;