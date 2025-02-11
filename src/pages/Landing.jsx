import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Welcome to <span className="text-primary">ProDesk</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your complete guide to managing projects, tasks, and time efficiently
          </p>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-6 mb-12"
        >
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Coffee className="text-primary" />
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {step}
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">
                    {step === 1 ? "Create Account" : step === 2 ? "Add Project" : "Start Tracking"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step === 1 
                      ? "Sign up and complete your profile" 
                      : step === 2 
                      ? "Create your first project and add tasks" 
                      : "Start tracking time and managing work"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Additional Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400">
            Need more help? Contact our support team at{' '}
            <a href="mailto:support@prodesk.com" className="text-primary hover:text-primary/80">
              support@prodesk.com
            </a>
          </p>
        </motion.div>

        <Link
          to="/user-manual"
          className="btn btn-outline-primary"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default Landing; 