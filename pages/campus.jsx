import { motion } from 'framer-motion';
import { FiCoffee, FiActivity } from 'react-icons/fi';

export default function Campus() {
  const comingSoonFeatures = [
    { icon: FiCoffee, label: 'Cafeteria Hours', color: 'from-orange-500 to-orange-600' },
    { icon: FiActivity, label: 'Gym Hours', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] bg-transparent px-6 py-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-2xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Campus Info
        </h2>
        <p className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Coming Soon</p>
        <p className="text-gray-400 text-lg">
          Get real-time information about campus facilities
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-5">
        {comingSoonFeatures.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-[#1C1C1C] to-[#171717] rounded-3xl p-6 border border-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                <feature.icon size={36} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-400">Coming soon...</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
