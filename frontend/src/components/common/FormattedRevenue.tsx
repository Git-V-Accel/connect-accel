import React from 'react';

interface FormattedRevenueProps {
  revenue: number;
  className?: string;
}

const FormattedRevenue: React.FC<FormattedRevenueProps> = ({ revenue, className = '' }) => {
  const formatRevenue = (value: number) => {
    if (value >= 10000000) { // 1 Crore+
      return `₹${(value / 10000000).toFixed(1)}C`;
    } else if (value >= 1000000) { // 1 Million+
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) { // 1 Thousand+
      return `₹${(value / 1000).toFixed(1)}K`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  return (
    <span className={className}>
      {formatRevenue(revenue)}
    </span>
  );
};

export default FormattedRevenue;
