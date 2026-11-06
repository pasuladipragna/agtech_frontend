import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function DataCard({ title, value, icon: Icon, description, trend }: DataCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-agri-beige p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {Icon && (
            <div className="p-3 bg-agri-green/10 rounded-lg">
              <Icon className="h-6 w-6 text-agri-green" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      
      {(trend || description) && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {trend ? (
            <div className="flex items-center text-sm">
              <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-2 text-gray-500">{trend.label}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
