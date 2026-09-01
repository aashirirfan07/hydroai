import React from 'react';
import IncidentAnalyticsDashboard from '@/components/ui/funnel-chart-big';

function IncidentAnalyticsDashboardDemo() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <button 
        onClick={toggleDarkMode} 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-300"
      >
        Toggle Dark Mode (for demo)
      </button>
      <IncidentAnalyticsDashboard />
    </div>
  );
}

export default IncidentAnalyticsDashboardDemo;
