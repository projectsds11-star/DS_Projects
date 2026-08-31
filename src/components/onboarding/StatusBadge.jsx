import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  Mail, 
  UserCheck, 
  AlertCircle, 
  XCircle, 
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

const STATUS_CONFIG = {
  'Employee Created': {
    label: 'Employee Created',
    icon: UserCheck,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  'Pending Offer': {
    label: 'Pending Offer',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  'Offer Draft': {
    label: 'Offer Draft',
    icon: FileText,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500',
  },
  'Offer Generated': {
    label: 'Offer Generated',
    icon: FileText,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    icon: Send,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  'Email Delivered': {
    label: 'Email Delivered',
    icon: Mail,
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  'Offer Accepted': {
    label: 'Offer Accepted',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  'Account Pending': {
    label: 'Account Pending',
    icon: Clock,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  'Account Activated': {
    label: 'Account Activated',
    icon: ShieldCheck,
    bg: 'bg-blue-50',
    text: 'text-[var(--color-primary)]',
    border: 'border-blue-200',
    dot: 'bg-[var(--color-primary)]',
  },
  'Onboarding Completed': {
    label: 'Onboarding Completed',
    icon: Check,
    bg: 'bg-green-50',
    text: 'text-green-800 font-semibold',
    border: 'border-green-300',
    dot: 'bg-green-600',
  },
  'Offer Rejected': {
    label: 'Offer Rejected',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  'Email Failed': {
    label: 'Email Failed',
    icon: AlertCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  'Draft': {
    label: 'Draft',
    icon: FileText,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-400',
  },
  'Active': {
    label: 'Active',
    icon: CheckCircle2,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  'Onboarding': {
    label: 'Onboarding',
    icon: Clock,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
};

export default function StatusBadge({ status = 'Pending Offer', showIcon = true, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all shadow-xs shrink-0',
        config.bg,
        config.text,
        config.border,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
