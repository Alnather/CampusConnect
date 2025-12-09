import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';

// Utility function to capitalize first letters
const capitalizeName = (name) => {
  if (!name) return '';
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export default function MessageNotification({ user }) {
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const lastMessageRef = useRef({}); // Track last message per thread to avoid duplicates
  const timeoutRef = useRef(null);

  // Check if user is currently viewing a specific thread
  const isOnMessagesPage = router.pathname === '/messages';
  const isOnRidePage = router.pathname.startsWith('/ride/');
  const currentRideId = isOnRidePage ? router.query.id : null;
  const currentChatId = router.query.id; // For chat/[id] pages

  useEffect(() => {
    if (!user) return;

    const unsubscribers = [];

    // Listen to rides where user is a participant
    const ridesRef = collection(db, 'rides');
    const ridesQuery = query(ridesRef, where('participants', 'array-contains', user.uid));

    const ridesUnsubscribe = onSnapshot(ridesQuery, (snapshot) => {
      snapshot.docs.forEach((rideDoc) => {
        const rideId = rideDoc.id;
        const rideData = rideDoc.data();

        // Listen to messages in this ride
        const messagesRef = collection(db, 'rides', rideId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

        const msgUnsubscribe = onSnapshot(messagesQuery, async (msgSnapshot) => {
          if (msgSnapshot.empty) return;

          const latestMsg = msgSnapshot.docs[0];
          const msgData = latestMsg.data();
          const msgId = latestMsg.id;

          // Skip if it's from the current user
          if (msgData.senderId === user.uid) return;

          // Skip if we've already processed this message (mark as seen without showing)
          if (lastMessageRef.current[rideId] === msgId) return;

          // Always mark as processed immediately
          lastMessageRef.current[rideId] = msgId;

          // Don't show notification if user is on messages page or viewing this ride
          if (isOnMessagesPage || currentRideId === rideId) return;

          // Check if message is recent (within last 10 seconds)
          const msgTime = msgData.timestamp?.toDate?.() || new Date();
          const now = new Date();
          if (now - msgTime > 10000) return;

          // Show notification
          showNotification({
            type: 'ride',
            threadId: rideId,
            title: rideData.destination || 'Ride Chat',
            message: msgData.text,
            senderName: msgData.senderName || 'Someone',
          });
        });

        unsubscribers.push(msgUnsubscribe);
      });
    });

    unsubscribers.push(ridesUnsubscribe);

    // Listen to direct messages
    const directMsgsRef = collection(db, 'directMessages');
    const directQuery = query(directMsgsRef, where('participants', 'array-contains', user.uid));

    const directUnsubscribe = onSnapshot(directQuery, (snapshot) => {
      snapshot.docs.forEach((threadDoc) => {
        const threadId = threadDoc.id;
        const threadData = threadDoc.data();

        // Listen to messages in this thread
        const messagesRef = collection(db, 'directMessages', threadId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

        const msgUnsubscribe = onSnapshot(messagesQuery, async (msgSnapshot) => {
          if (msgSnapshot.empty) return;

          const latestMsg = msgSnapshot.docs[0];
          const msgData = latestMsg.data();
          const msgId = latestMsg.id;

          // Skip if it's from the current user
          if (msgData.senderId === user.uid) return;

          // Skip if we've already processed this message (mark as seen without showing)
          if (lastMessageRef.current[threadId] === msgId) return;

          // Always mark as processed immediately
          lastMessageRef.current[threadId] = msgId;

          // Don't show notification if user is on messages page
          if (isOnMessagesPage) return;

          // Check if message is recent (within last 10 seconds)
          const msgTime = msgData.timestamp?.toDate?.() || new Date();
          const now = new Date();
          if (now - msgTime > 10000) return;

          // Get sender name
          const otherUserId = threadData.participants?.find(id => id !== user.uid);
          let senderName = msgData.senderName || 'Someone';
          
          try {
            if (otherUserId) {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                senderName = capitalizeName(userDoc.data().name || userDoc.data().email || 'Someone');
              }
            }
          } catch (e) {
            // Ignore errors
          }

          // Show notification
          showNotification({
            type: 'direct',
            threadId: threadId,
            title: senderName,
            message: msgData.text,
            senderName: senderName,
          });
        });

        unsubscribers.push(msgUnsubscribe);
      });
    });

    unsubscribers.push(directUnsubscribe);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, currentRideId, isOnMessagesPage]);

  const showNotification = ({ type, threadId, title, message, senderName }) => {
    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setNotification({
      type,
      threadId,
      title,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      senderName,
    });
    setIsVisible(true);

    // Auto-hide after 1.5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
  };

  const handleClick = () => {
    if (!notification) return;
    
    setIsVisible(false);
    
    if (notification.type === 'ride') {
      router.push(`/ride/${notification.threadId}`);
    } else {
      router.push(`/messages?category=direct`);
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={handleClick}
          className="fixed top-4 left-1/2 z-[100] cursor-pointer"
          style={{ maxWidth: '90vw', width: '400px' }}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                <FiMessageCircle className="text-primary" size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500">now</span>
                </div>
                <p className="text-gray-400 text-xs truncate">
                  {notification.message}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              >
                <FiX className="text-gray-400" size={16} />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 1.5, ease: 'linear' }}
              className="h-0.5 bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
