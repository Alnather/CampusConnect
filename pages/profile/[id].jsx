import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPackage, FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';
import { HiArrowLeft } from 'react-icons/hi';
import { MdFlight, MdVerified, MdShoppingCart, MdLocationCity, MdSchool, MdArrowRightAlt } from 'react-icons/md';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Utility function to capitalize names
const capitalizeName = (name) => {
  if (!name) return '';
  return name.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Destination theme detection for rides
const shoppingLocations = ['target', 'walmart', 'costco', 'whole foods', 'trader joe', 'jewel', 'mariano', 'mall', 'outlet'];
const downtownKeywords = ['downtown', 'city center', 'downtown chicago', 'magnificent mile', 'loop', 'chicago'];
const collegeKeywords = ['lake forest', 'college', 'university', 'campus', 'northwestern', 'depaul', 'loyola', 'uic', 'uchicago'];

const destinationThemes = {
  'airport': { icon: MdFlight, gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent', iconColor: 'text-cyan-400' },
  'shopping': { icon: MdShoppingCart, gradient: 'from-red-500/20 via-pink-500/10 to-transparent', iconColor: 'text-pink-400' },
  'downtown': { icon: MdLocationCity, gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent', iconColor: 'text-indigo-400' },
  'college': { icon: MdSchool, gradient: 'from-green-500/20 via-emerald-500/10 to-transparent', iconColor: 'text-emerald-400' },
  'default': { icon: FiMapPin, gradient: 'from-gray-500/20 via-gray-500/10 to-transparent', iconColor: 'text-gray-400' }
};

const getDestinationTheme = (destination) => {
  const lowerDest = destination?.toLowerCase() || '';
  if (lowerDest.includes('airport') || lowerDest.includes('ord') || lowerDest.includes('mdw')) return destinationThemes['airport'];
  if (shoppingLocations.some(shop => lowerDest.includes(shop))) return destinationThemes['shopping'];
  if (downtownKeywords.some(keyword => lowerDest.includes(keyword))) return destinationThemes['downtown'];
  if (collegeKeywords.some(keyword => lowerDest.includes(keyword))) return destinationThemes['college'];
  return destinationThemes['default'];
};

// Format date from Timestamp or string
const formatRideDate = (date) => {
  if (!date) return 'No date';
  let dateObj;
  if (date?.toDate) {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date + 'T12:00:00');
  } else {
    return 'Invalid date';
  }
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch profile user data
  useEffect(() => {
    if (!id || !currentUser) return;

    // If viewing own profile, redirect to main profile page
    if (id === currentUser.uid) {
      router.push('/profile');
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setProfileUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          // User not found
          setProfileUser(null);
        }

        // Fetch user's listings (filter sold client-side to avoid index requirement)
        const listingsQuery = query(
          collection(db, 'products'),
          where('userId', '==', id),
          orderBy('createdAt', 'desc'),
          limit(12)
        );
        const listingsSnap = await getDocs(listingsQuery);
        // Filter out sold items client-side
        setListings(listingsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(listing => !listing.sold)
          .slice(0, 6)
        );

        // Fetch user's rides (where they are organizer)
        // console.log('Fetching rides for organizerId:', id);
        const ridesQuery = query(
          collection(db, 'rides'),
          where('organizerId', '==', id),
          limit(20)
        );
        const ridesSnap = await getDocs(ridesQuery);
        // console.log('Rides found:', ridesSnap.docs.length);
        
        // Filter expired rides and sort client-side
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const filteredRides = ridesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(ride => {
            // Handle both Timestamp objects and string dates
            let rideDate;
            if (ride.date?.toDate) {
              // Firestore Timestamp
              rideDate = ride.date.toDate();
            } else if (typeof ride.date === 'string') {
              // String date like "2025-12-19"
              rideDate = new Date(ride.date);
            } else {
              return false;
            }
            return rideDate >= today;
          })
          .sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateA - dateB;
          })
          .slice(0, 6);
        console.log('Filtered rides:', filteredRides);
        setRides(filteredRides);

      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <div className="text-gray-400 text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiUser size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-6">This profile doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary/20 text-primary rounded-full font-semibold hover:bg-primary/30 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName = capitalizeName(
    profileUser.name || 
    profileUser.firstName && profileUser.lastName 
      ? `${profileUser.firstName} ${profileUser.lastName}` 
      : profileUser.email?.split('@')[0] || 'User'
  );

  const memberSince = profileUser.createdAt?.toDate 
    ? profileUser.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently joined';

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 flex flex-col items-center">
      {/* Header with Back Button */}
      <div className="w-full backdrop-blur-2xl" style={{ marginTop: "2vh", marginBottom: "2vh" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-full transition-all hover:bg-white/5 text-white"
          >
            <HiArrowLeft size={28} />
          </motion.button>
          
          {/* Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Back
          </motion.h1>
        </div>
      </div>

      <div 
        className="w-full max-w-2xl mx-auto py-8"
        style={isMobile ? { paddingLeft: '4vw', paddingRight: '4vw' } : { paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {/* Avatar */}
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-white/10 overflow-hidden">
            {profileUser.photoURL ? (
              <img src={profileUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <FiUser size={56} className="text-white" />
            )}
          </div>

          {/* Name with Verified Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white">{displayName}</h2>
            {profileUser.emailVerified && (
              <MdVerified className="text-primary" size={28} />
            )}
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <FiCalendar size={16} />
            <span className="text-sm">Member since {memberSince}</span>
          </div>

          {/* Verified Badge */}
          {profileUser.emailVerified && (
            <span className="inline-block px-4 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
              ✓ Verified Student
            </span>
          )}
        </motion.div>

        {/* Listings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <FiPackage size={20} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Listings</h3>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center" style={{ minHeight: '10vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* <FiPackage size={32} className="mx-auto text-gray-600 mb-3" /> */}
              <p className="text-gray-400">No active listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/listing/${listing.id}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 mb-2">
                    {listing.photo ? (
                      <img src={listing.photo} alt={listing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage size={32} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{listing.name}</p>
                  <p className="text-sm text-primary font-bold">
                    {listing.priceType === 'free' || listing.price === 0 ? 'FREE' : `$${listing.price}`}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rides Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{marginTop:"3vh"}}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <MdFlight size={20} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Rides</h3>
          </div>

          {rides.length === 0 ? (
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center" style={{ minHeight: '10vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* <MdFlight size={32} className="mx-auto text-gray-600 mb-3" /> */}
              <p className="text-gray-400">No upcoming rides</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride, index) => {
                const theme = getDestinationTheme(ride.destination);
                const DestIcon = theme.icon;
                
                return (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => router.push(`/ride/${ride.id}`)}
                    className="group relative cursor-pointer"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Card */}
                    <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group-hover:border-white/20 transition-all duration-300">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`} />
                      
                      {/* Content */}
                      <div className="relative p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <DestIcon className={theme.iconColor} size={28} />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-lg truncate">{ride.destination}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{formatRideDate(ride.date)}</span>
                            <span className="text-gray-600">•</span>
                            <span>{ride.time}</span>
                          </div>
                        </div>
                        
                        {/* Right side */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <FiUsers size={14} />
                              <span>{ride.members || 1}/{ride.seats}</span>
                            </div>
                          </div>
                          <MdArrowRightAlt className="text-primary" size={24} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
