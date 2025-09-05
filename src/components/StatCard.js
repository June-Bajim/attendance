import React from 'react';

/**
 * StatCard component for displaying statistics with icons
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.Component} props.icon - Lucide React icon component
 * @param {string} props.color - Primary color for the card
 * @param {string} props.subtitle - Optional subtitle text
 * @param {string} props.trend - Optional trend indicator
 * @param {function} props.onClick - Optional click handler
 */
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  trend,
  onClick 
}) => {
  console.log("StatCard received icon:", Icon);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
      }`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${
                trend.startsWith('+') ? 'text-green-600' : 
                trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="p-3 rounded-full transition-all duration-200"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-8 h-8 transition-transform duration-200 hover:scale-110" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;