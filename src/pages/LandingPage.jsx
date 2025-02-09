import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const features = [
  'Smart project management tools',
  'Time tracking with detailed reports',
  'Client management and collaboration',
  'Beautiful and intuitive interface',
  'Real-time updates and notifications',
  'Secure data with Firebase backend'
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-650 via-red-800 to-black" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,0,0.1)_50%,transparent_75%)] bg-[length:200%_200%] animate-[gradient_8s_ease-in-out_infinite]" />
      
      {/* Content */}
      <div className="relative">
        <div className="container mx-auto px-4 py-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-red-500" size={24} />
              <h1 className="text-2xl font-bold text-white">ProDesk</h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-full bg-red-500/10 text-white border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
          </nav>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center transform transition-all duration-700 hover:scale-[1.02]">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Manage Your Projects with Ease
            </h1>
            <p className="text-xl text-red-100/80 mb-8">
              ProDesk is your all-in-one solution for project management, time tracking, 
              and client collaboration. Built for modern teams and freelancers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 rounded-full bg-red-500/10 text-white border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-4xl mx-auto mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-red-500/5 rounded-lg p-4 border border-red-500/10 hover:bg-red-500/10 transition-all duration-300 hover:scale-105 hover:border-red-500/20"
                >
                  <CheckCircle2 className="text-red-500" size={24} />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '1000+', label: 'Active Users' },
              { value: '50k+', label: 'Projects Managed' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} className="text-center transform transition-all duration-500 hover:scale-110">
                <h3 className="text-4xl font-bold text-red-500 mb-2">{stat.value}</h3>
                <p className="text-red-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;