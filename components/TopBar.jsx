import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

export default function TopBar() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#171717]/95 backdrop-blur-lg border-b border-white/10 z-40 px-4">
      <div className="flex justify-between items-center h-16 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">
          <span className="text-white">Campus</span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Connect</span>
        </h1>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/profile')}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center hover:border-primary transition-all"
        >
          <FiUser size={20} className="text-primary" />
        </motion.button>
      </div>
    </header>
  );
}
