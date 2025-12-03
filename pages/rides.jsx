import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiPlus, FiMapPin, FiCalendar, FiClock, FiUsers, FiChevronRight } from 'react-icons/fi';
import { MdFlight, MdShoppingCart, MdLocationCity } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const destinationThemes = {
  'Airport': {
    icon: MdFlight,
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    iconColor: 'text-cyan-400',
    glow: 'shadow-cyan-500/20'
  },
  'Target': {
    icon: MdShoppingCart,
    gradient: 'from-red-500/20 via-pink-500/10 to-transparent',
    iconColor: 'text-pink-400',
    glow: 'shadow-pink-500/20'
  },
  'Downtown': {
    icon: MdLocationCity,
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    iconColor: 'text-indigo-400',
    glow: 'shadow-indigo-500/20'
  }
};

export default function Rides() {
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [showFABWiggle, setShowFABWiggle] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Mock data
  const mockRides = [
    {
      id: 1,
      destination: 'Airport',
      date: '2025-12-05',
      time: '08:00 AM',
      organizer: 'Sarah M.',
      seats: 3,
      members: 2,
    },
    {
      id: 2,
      destination: 'Target',
      date: '2025-12-04',
      time: '02:00 PM',
      organizer: 'John D.',
      seats: 4,
      members: 1,
    },
    {
      id: 3,
      destination: 'Airport',
      date: '2025-12-06',
      time: '10:30 AM',
      organizer: 'Emily R.',
      seats: 4,
      members: 3,
    },
    {
      id: 4,
      destination: 'Downtown',
      date: '2025-12-04',
      time: '06:00 PM',
      organizer: 'Mike T.',
      seats: 3,
      members: 1,
    },
  ];

  useEffect(() => {
    // Load rides - replace with actual API call
    setRides(mockRides);
    setFilteredRides(mockRides);
  }, []);

  useEffect(() => {
    // Filter rides based on criteria
    let filtered = rides;

    if (destination) {
      filtered = filtered.filter((ride) =>
        ride.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((ride) => ride.date === dateStr);
    }

    if (selectedTime) {
      filtered = filtered.filter((ride) => ride.time.startsWith(selectedTime));
    }

    setFilteredRides(filtered);

    // Show wiggle animation if no results
    if (filtered.length === 0 && (destination || selectedDate || selectedTime)) {
      setTimeout(() => setShowFABWiggle(true), 1000);
      setTimeout(() => setShowFABWiggle(false), 2000);
    }
  }, [destination, selectedDate, selectedTime, rides]);

  const handleCreateRide = () => {
    // Navigate to create ride page
    console.log('Create ride clicked');
  };

  const handleJoinRide = (rideId) => {
    // Handle join ride logic
    console.log('Join ride:', rideId);
  };

  const getDestinationTheme = (dest) => {
    return destinationThemes[dest] || {
      icon: FiMapPin,
      gradient: 'from-gray-500/20 via-gray-500/10 to-transparent',
      iconColor: 'text-gray-400',
      glow: 'shadow-gray-500/20'
    };
  };

  return (
    <div ref={containerRef} className="w-full pb-32">
      {/* Filters Section - Glassmorphism */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-[#0A0A0A]/60 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Destination Filter */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <FiMapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" size={22} />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-white text-lg placeholder-gray-500 focus:border-primary/50 focus:outline-none focus:bg-white/10 transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Date and Time Filters */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <motion.div
                whileFocus={{ scale: 1.01 }}
                className="relative group"
              >
                <FiCalendar className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none group-focus-within:text-primary transition-colors duration-300" size={20} />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholderText="Date"
                  className="w-full pl-14 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none focus:bg-white/10 transition-all duration-300"
                  minDate={new Date()}
                />
              </motion.div>

              {/* Time Input */}
              <motion.div
                whileFocus={{ scale: 1.01 }}
                className="relative group"
              >
                <FiClock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 group-focus-within:text-primary transition-colors duration-300" size={20} />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none focus:bg-white/10 transition-all duration-300"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rides Grid with Parallax */}
      <motion.div style={{ y }} className="max-w-2xl mx-auto px-6 pt-8 pb-32">
        {filteredRides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <FiMapPin size={48} className="text-gray-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3">No rides found</h3>
            <p className="text-gray-400 text-lg">Create a new ride to get started!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredRides.map((ride, index) => {
                const theme = getDestinationTheme(ride.destination);
                const DestIcon = theme.icon;
                const seatsLeft = ride.seats - ride.members;
                
                return (
                  <motion.div
                    key={ride.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Card */}
                    <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-300">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`} />
                      
                      <div className="relative p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} backdrop-blur-xl border border-white/20 flex items-center justify-center ${theme.glow} shadow-xl`}
                            >
                              <DestIcon className={theme.iconColor} size={32} />
                            </motion.div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                {ride.destination}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FiUsers size={14} />
                                <span>{ride.members}/{ride.seats} riders</span>
                              </div>
                            </div>
                          </div>
                          
                          {seatsLeft === 1 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-4 py-1.5 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full text-primary text-xs font-semibold"
                            >
                              Last Seat!
                            </motion.span>
                          )}
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center gap-4 mb-8">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10"
                          >
                            <FiCalendar className="text-gray-400" size={18} />
                            <span className="text-white font-medium">
                              {new Date(ride.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10"
                          >
                            <FiClock className="text-gray-400" size={18} />
                            <span className="text-white font-medium">{ride.time}</span>
                          </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Organized by <span className="text-white font-semibold">{ride.organizer}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleJoinRide(ride.id)}
                            className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center gap-2"
                          >
                            Join
                            <FiChevronRight size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        animate={showFABWiggle ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCreateRide}
        className="fixed bottom-28 right-6 w-20 h-20 bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-2xl shadow-primary/50 flex items-center justify-center z-50 border-2 border-white/20 backdrop-blur-xl"
        style={{ backgroundSize: '200% 200%', animation: 'gradient 3s ease infinite' }}
      >
        <FiPlus size={36} className="text-white" strokeWidth={3} />
      </motion.button>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
