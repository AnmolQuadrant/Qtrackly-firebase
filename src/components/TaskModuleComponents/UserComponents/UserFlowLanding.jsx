// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import Logo from '../../../../assets/Logo.png';
 
// const LandingPage = () => {
//   const { isAuthenticated, isInitialized, authState, getPrimaryRole } = useAuth();
//   const navigate = useNavigate();
//   const [mockTaskCount, setMockTaskCount] = useState(10);
//   const [isVisible, setIsVisible] = useState(false);
//   const [currentFeature, setCurrentFeature] = useState(0);
 
//   // Simulate real-time task updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMockTaskCount((prev) => prev + Math.floor(Math.random() * 3));
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);
 
//   // Animate elements on load
//   useEffect(() => {
//     setIsVisible(true);
   
//     // Cycle through features for attention
//     const featureInterval = setInterval(() => {
//       setCurrentFeature((prev) => (prev + 1) % 3);
//     }, 3000);
   
//     return () => clearInterval(featureInterval);
//   }, []);
 
//   // Redirect authenticated users to their dashboard
//   useEffect(() => {
//     if (isAuthenticated && isInitialized && authState === 'authenticated') {
//       const primaryRole = getPrimaryRole();
//       const navigationMap = {
//         admin: '/admin',
//         manager: '/manager',
//         user: '/admin',
//       };
//       const destination = navigationMap[primaryRole] || '/dashboard';
//       navigate(destination, { replace: true });
//     }
//   }, [isAuthenticated, isInitialized, authState, getPrimaryRole, navigate]);
 
//   // Microsoft logo component
//   const MicrosoftIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M11.4 3H3v8.4h8.4V3z" fill="#F25022"/>
//       <path d="M21 3h-8.4v8.4H21V3z" fill="#7FBA00"/>
//       <path d="M11.4 12.6H3V21h8.4v-8.4z" fill="#00A4EF"/>
//       <path d="M21 12.6h-8.4V21H21v-8.4z" fill="#FFB900"/>
//     </svg>
//   );
 
//   const features = [
//     {
//       icon: (
//         <svg className="w-8 h-8 text-white mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       ),
//       title: "Real-Time Task Management",
//       description: "Track and update tasks instantly with real-time notifications and seamless collaboration.",
//       color: "from-purple-500 to-pink-500"
//     },
//     {
//       icon: (
//         <svg className="w-8 h-8 text-white mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//         </svg>
//       ),
//       title: "Role-Based Access Control",
//       description: "Customized dashboards and permissions for admins, managers, and team members.",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: (
//         <svg className="w-8 h-8 text-white mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//         </svg>
//       ),
//       title: "Enterprise Security",
//       description: "AES-encrypted data protection with advanced security measures and compliance.",
//       color: "from-green-500 to-teal-500"
//     }
//   ];
 
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
//       </div>
 
//       {/* Navigation Bar */}
//       <nav className={`relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 py-4 px-6 flex justify-between items-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
//         <div className="flex items-center gap-3 group">
//           <div className="relative">
//             <img src={Logo} alt="Quadrant Technologies Logo" className="w-12 h-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300" />
//             <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
//           </div>
//           <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Quadrant Technologies
//           </span>
//         </div>
//         <button
//           onClick={() => navigate('/login')}
//           className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full font-medium flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
//         >
//           <MicrosoftIcon />
//           <span className="group-hover:tracking-wide transition-all duration-300">Sign In</span>
//         </button>
//       </nav>
 
//       {/* Hero Section */}
//       <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
//         <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-[700px] text-center border border-white/20 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
//           <div className="w-[100px] h-[100px] mx-auto mb-8 rounded-full flex items-center justify-center relative group">
//             <img
//               src={Logo}
//               alt="Quadrant Technologies Logo"
//               className="rounded-full w-full h-full object-cover shadow-2xl group-hover:scale-110 transition-transform duration-500"
//             />
//             <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
//           </div>
         
//           <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
//             <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
//               Welcome to the Future
//             </span>
//             <br />
//             <span className="text-gray-800">of Work Management</span>
//           </h1>
         
//           <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-md mx-auto">
//             Revolutionize your workflow with AI-powered task management, real-time collaboration, and enterprise-grade security.
//           </p>
         
//           <div className="space-y-4">
//             <button
//               onClick={() => navigate('/login')}
//               className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-full font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-pink-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
//               aria-label="Sign in with Microsoft"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <MicrosoftIcon />
//               <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
//                 Get Started with Microsoft
//               </span>
//               <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </button>
           
//             <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span>99.9% Uptime</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
//                 <span>Enterprise Ready</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-500"></div>
//                 <span>24/7 Support</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
 
//       {/* Features Section */}
//       <div className="relative z-10 bg-gradient-to-r from-purple-900/5 to-pink-900/5 py-20 px-4">
//         <div className="max-w-6xl mx-auto">
//           <div className={`text-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
//               Why Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Quadrant?</span>
//             </h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Experience the next generation of productivity tools designed for modern teams
//             </p>
//           </div>
         
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className={`group relative overflow-hidden bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${currentFeature === index ? 'ring-2 ring-purple-500 scale-105' : ''} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
//                 style={{ transitionDelay: `${700 + index * 200}ms` }}
//               >
//                 <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
               
//                 <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                   {feature.icon}
//                 </div>
               
//                 <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
//                   {feature.title}
//                 </h3>
               
//                 <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
//                   {feature.description}
//                 </p>
               
//                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
 
//       {/* Real-Time Ticker */}
//       <div className="fixed bottom-6 right-6 z-50">
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
//           <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//           <span className="font-medium">{mockTaskCount} tasks updated</span>
//           <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-500"></div>
//         </div>
//       </div>
 
//       {/* Stats Section */}
//       <div className="relative z-10 bg-gradient-to-r from-gray-900 to-purple-900 py-16 px-4">
//         <div className="max-w-4xl mx-auto text-center">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-white">
//               <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//                 10K+
//               </div>
//               <div className="text-gray-300">Active Users</div>
//             </div>
//             <div className="text-white">
//               <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                 1M+
//               </div>
//               <div className="text-gray-300">Tasks Completed</div>
//             </div>
//             <div className="text-white">
//               <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
//                 99.9%
//               </div>
//               <div className="text-gray-300">Uptime</div>
//             </div>
//           </div>
//         </div>
//       </div>
 
//       {/* Footer */}
//       <footer className="relative z-10 bg-white/80 backdrop-blur-md py-8 px-4 text-center border-t border-white/20">
//         <div className="max-w-4xl mx-auto">
//           <p className="text-gray-600 mb-4">
//             &copy; 2025 Quadrant Technologies. Empowering teams worldwide.
//           </p>
//           <div className="flex justify-center gap-6 text-sm">
//             <a href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
//               Terms of Service
//             </a>
//             <a href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
//               Privacy Policy
//             </a>
//             <a href="/contact" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 hover:underline">
//               Contact Us
//             </a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };
 
// export default LandingPage;
 

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, BarChart2, Clock, Lock, ArrowRight } from 'lucide-react';
import Logo from '../../../../assets/Logo.png';
 
const LandingPage = () => {
  const { isAuthenticated, isInitialized, authState, getPrimaryRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTagline, setCurrentTagline] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
 
  // Taglines for rotating hero text
  const taglines = useMemo(
    () => [
      'Streamline Tasks, Boost Productivity',
      'Track Dependencies with Ease',
      'Gain Insights with Performance Metrics',
      'Manage Workloads with Timesheets',
    ],
    []
  );
 
  // Banner content for the hero section carousel
  const banners = useMemo(
    () => [
      {
        title: 'Effortless Task Management',
        description: 'Create, assign, and track tasks with seamless dependency management.',
        image: 'https://via.placeholder.com/1920x600/6B46C1/FFFFFF?text=Task+Management',
        color: 'from-violet-600 to-purple-600',
      },
      {
        title: 'Real-Time Performance Insights',
        description: 'Monitor team performance with detailed metrics and analytics.',
        image: 'https://via.placeholder.com/1920x600/3182CE/FFFFFF?text=Performance+Insights',
        color: 'from-blue-600 to-cyan-600',
      },
      {
        title: 'Optimized Timesheet Tracking',
        description: 'Plan and visualize workloads with intuitive timesheet tools.',
        image: 'https://via.placeholder.com/1920x600/319795/FFFFFF?text=Timesheet+Tracking',
        color: 'from-green-600 to-teal-600',
      },
    ],
    []
  );
 
  // Generate random star positions and animations
  const stars = useMemo(() => {
    const starCount = 20; // Number of stars
    return Array.from({ length: starCount }, () => ({
      x: Math.random() * 100, // Percentage across width
      y: Math.random() * 100, // Percentage across height
      scale: Math.random() * 0.5 + 0.5, // Random scale between 0.5 and 1
      delay: Math.random() * 2, // Random animation delay
    }));
  }, []);
 
  // Cycle taglines
  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(taglineInterval);
  }, [taglines.length]);
 
  // Cycle banners
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);
 
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && isInitialized && authState === 'authenticated') {
      const primaryRole = getPrimaryRole();
      const navigationMap = {
        admin: '/admin',
        manager: '/manager',
        user: '/admin',
      };
      const destination = navigationMap[primaryRole] || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isInitialized, authState, getPrimaryRole, navigate]);
 
  // Microsoft Icon
  const MicrosoftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.4 3H3v8.4h8.4V3z" fill="#F25022" />
      <path d="M21 3h-8.4v8.4H21V3z" fill="#7FBA00" />
      <path d="M11.4 12.6H3V21h8.4v-8.4z" fill="#00A4EF" />
      <path d="M21 12.6h-8.4V21H21v-8.4z" fill="#FFB900" />
    </svg>
  );
 
  // Feature data
  const features = useMemo(
    () => [
      {
        icon: <Users className="w-10 h-10 text-white" />,
        title: 'Task & Dependency Management',
        description: 'Effortlessly create, assign, and track tasks with dependency management for seamless project workflows, powered by QTrackly.',
        color: 'from-violet-600 to-purple-600',
      },
      {
        icon: <BarChart2 className="w-10 h-10 text-white" />,
        title: 'Performance Insights',
        description: 'Monitor team performance with real-time metrics on task completion, hours logged, and overdue tasks.',
        color: 'from-blue-600 to-cyan-600',
      },
      {
        icon: <Clock className="w-10 h-10 text-white" />,
        title: 'Timesheet Tracking',
        description: 'Visualize weekly, monthly, and yearly timesheets to optimize workloads and resource planning.',
        color: 'from-green-600 to-teal-600',
      },
      {
        icon: <Lock className="w-10 h-10 text-white" />,
        title: 'Enterprise Security',
        description: 'Secure your data with AES encryption and role-based access control for safe collaboration.',
        color: 'from-purple-600 to-pink-600',
      },
    ],
    []
  );
 
  // How QTrackly Works data
  const howItWorks = useMemo(
    () => [
      {
        title: 'Create and Manage Tasks',
        description: 'Easily create tasks, assign them to team members, and track progress with a user-friendly interface, ensuring projects stay on schedule.',
        icon: <Users className="w-10 h-10 text-white" />,
        color: 'from-violet-600 to-purple-600',
      },
      {
        title: 'Track Task Dependencies',
        description: 'Manage dependencies between tasks to streamline workflows, ensuring teams stay aligned and delays are minimized.',
        icon: <ArrowRight className="w-10 h-10 text-white" />,
        color: 'from-blue-600 to-cyan-600',
      },
      {
        title: 'Analyze Workload and Performance',
        description: 'Use timesheets and real-time analytics to monitor team performance, optimize resource allocation, and gain actionable insights.',
       
        icon: <BarChart2 className="w-10 h-10 text-white" />,
        color: 'from-green-600 to-teal-600',
      },
    ],
    []
  );
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-gray-50 to-purple-50 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.25, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
        />
      </div>
 
      {/* Navigation Bar */}
      <motion.nav
        className="relative z-20 bg-white/90 backdrop-blur-lg shadow-lg border-b border-violet-100 py-4 px-4 sm:px-6 lg:px-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <motion.img
              src={Logo}
              alt="QTrackly Logo"
              className="w-12 h-12 rounded-full object-cover shadow-md"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.3 }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              QTrackly
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-violet-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-violet-600 transition-colors">Testimonials</a>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all flex items-center gap-2"
            >
              <MicrosoftIcon />
              Sign In
            </button>
          </div>
          <button
            className="md:hidden text-gray-600 hover:text-violet-600"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white/90 backdrop-blur-lg px-4 py-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <a href="#features" className="block py-2 text-gray-600 hover:text-violet-600 transition-colors">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-violet-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="block py-2 text-gray-600 hover:text-violet-600 transition-colors">Testimonials</a>
              <button
                onClick={() => navigate('/login')}
                className="block py-2 px-4 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all w-full text-left"
              >
                Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
 
      {/* Hero Section with Background Banner and Animated Stars */}
      <motion.section
        className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Banner Carousel */}
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentBanner}
              className="absolute inset-0 w-full h-full"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${banners[currentBanner].image})` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentBanner].color} opacity-70`} />
                {/* Animated Stars */}
                <div className="absolute inset-0 pointer-events-none">
                  {stars.map((star, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                      }}
                      animate={{
                        scale: [star.scale, star.scale * 1.5, star.scale],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: star.delay,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Breadcrumb Navigation */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentBanner === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
 
        <div className="relative text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {banners[currentBanner].title}
          </motion.h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTagline}
              className="text-xl sm:text-2xl text-white mb-10 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {banners[currentBanner].description}
            </motion.p>
          </AnimatePresence>
          <motion.div
            className="flex justify-center gap-4 flex-wrap"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-white text-violet-600 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
              aria-label="Sign in with Microsoft"
            >
              <MicrosoftIcon />
              Get Started with Microsoft
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="px-6 py-3 border border-white text-white rounded-full hover:bg-white/10 transition-all shadow-md hover:shadow-lg"
            >
              Explore Features
            </a>
          </motion.div>
        </div>
      </motion.section>
 
      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Discover the Power of{' '}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            QTrackly
          </span>
        </motion.h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-violet-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              viewport={{ once: true }}
            >
              <div
                className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* How QTrackly Works Section */}
      <section id="how-it-works" className="relative z-10 bg-gradient-to-r from-violet-900 to-purple-900 py-16 px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-white mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          How{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            QTrackly
          </span>{' '}
          Works
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {howItWorks.map((item, index) => (
            <motion.div
              key={index}
              className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-violet-200/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
              viewport={{ once: true }}
            >
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}
              >
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 text-center">{item.title}</h3>
              <p className="text-violet-100 text-sm text-center">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-violet-50">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          What Our Users Say About{' '}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            QTrackly
          </span>
        </motion.h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: 'QTrackly’s dependency tracking has streamlined our project workflows like never before.',
              author: 'Anmol Singh',
              role: 'Project Manager',
            },
            {
              quote: 'The performance insights help me keep my team on track and address bottlenecks early.',
              author: 'Garraju Naresetti',
              role: 'Team Lead',
            },
            {
              quote: 'Timesheet tracking makes workload planning effortless and transparent.',
              author: 'Vonteru Pranay',
              role: 'Product Owner',
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <p className="text-gray-900 font-semibold">{testimonial.author}</p>
              <p className="text-gray-500 text-sm">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* Call-to-Action Section */}
      <motion.section
        className="relative z-10 bg-gradient-to-r from-violet-600 to-purple-600 py-20 px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-6"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Workflow with QTrackly?
        </motion.h2>
        <motion.p
          className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Join thousands of teams optimizing tasks, dependencies, and performance with QTrackly’s intuitive platform.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-violet-600 rounded-full flex items-center gap-2 mx-auto hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
          >
            <MicrosoftIcon />
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.section>
 
      {/* Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 border-t border-violet-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            © 2025 QTrackly. Empowering teams with smarter task management.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="/terms" className="text-gray-600 hover:text-violet-600 transition-colors">Terms of Service</a>
            <a href="/privacy" className="text-gray-600 hover:text-violet-600 transition-colors">Privacy Policy</a>
            <a href="/contact" className="text-gray-600 hover:text-violet-600 transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
 
export default LandingPage;
 