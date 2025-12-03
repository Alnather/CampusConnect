import { motion } from 'framer-motion';
import { FiPackage } from 'react-icons/fi';

export default function Marketplace() {
  return (
    <div className="w-full min-h-[calc(100vh-10rem)] bg-transparent flex items-center justify-center px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl shadow-primary/10"
        >
          <FiPackage size={64} className="text-primary" />
        </motion.div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          Marketplace
        </h2>
        <p className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Coming Soon</p>
        <p className="text-gray-400 text-lg leading-relaxed">
          Buy and sell items with your campus community. Stay tuned!
        </p>
      </motion.div>
    </div>
  );
}
