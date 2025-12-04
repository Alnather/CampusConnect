import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiAlignLeft } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CreateRide() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [seats, setSeats] = useState(4);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!destination || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Add Firebase logic to save ride
      console.log({
        destination,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        seats,
        description,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to rides page
      router.push('/rides');
    } catch (error) {
      console.error('Error creating ride:', error);
      alert('Failed to create ride. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#F9FAFB" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="w-full min-h-screen pb-32">
        {/* Header */}
        <div className="sticky top-0 z-30 backdrop-blur-2xl border-b border-white/5 pb-6">
          <div className="max-w-2xl mx-auto px-6 pt-8">
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <HiArrowLeft size={24} className="text-white" />
              </motion.button>
              <h1 className="text-3xl font-bold text-white">Create Ride</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-6 pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Destination *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={20} />
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    minDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select date"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Time *
                </label>
                <div className="relative">
                  <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={20} />
                  <DatePicker
                    selected={time}
                    onChange={(time) => setTime(time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    placeholderText="Select time"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Available Seats
              </label>
              <div className="relative">
                <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="8"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description (Optional)
              </label>
              <div className="relative">
                <FiAlignLeft className="absolute left-4 top-6 text-gray-400" size={20} />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any details about the ride..."
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Ride'}
            </motion.button>
          </form>
        </div>
      </div>
    </>
  );
}
