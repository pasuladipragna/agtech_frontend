import React from 'react';
import { TERMS } from '../../constants/terminology';

export type StatusVariant = 
  | 'success'   // Green (Healthy, Approved, Connected, Completed)
  | 'warning'   // Amber (Attention, Pending, Busy, Paused)
  | 'error'     // Terracotta (Problem, Rejected, Failed, Blocked)
  | 'info'      // Blue (Information only)
  | 'neutral';  // Gray (Disconnected, Unavailable)

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant; // If not provided, it maps automatically
  className?: string;
}

// Auto-map known statuses to their semantic color rules
const getAutoVariant = (status: string): StatusVariant => {
  const s = status.toUpperCase();
  if (['HEALTHY', 'APPROVED', 'CONNECTED', 'COMPLETED', 'READY'].includes(s)) return 'success';
  if (['PENDING', 'UNDER_REVIEW', 'NEEDS_ATTENTION', 'BUSY', 'PAUSED', 'MONITORING', 'RUNNING', 'SPRAYING'].includes(s)) return 'warning';
  if (['PROBLEM_DETECTED', 'REJECTED', 'FAILED', 'BLOCKED', 'ABORTED', 'EMERGENCY_STOP'].includes(s)) return 'error';
  if (['DISCONNECTED', 'UNAVAILABLE', 'OFFLINE', 'STOPPED'].includes(s)) return 'neutral';
  return 'neutral';
};

const getVariantClasses = (variant: StatusVariant) => {
  switch (variant) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'neutral':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatStatusText = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function StatusBadge({ status, variant, className = '' }: StatusBadgeProps) {
  const v = variant || getAutoVariant(status);
  const classes = getVariantClasses(v);
  const text = formatStatusText(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes} ${className}`}>
      {text}
    </span>
  );
}
