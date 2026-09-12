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
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'Pending Offer': {
    label: 'Pending Offer',
    icon: Clock,
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'Offer Draft': {
    label: 'Offer Draft',
    icon: FileText,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'Offer Generated': {
    label: 'Offer Generated',
    icon: FileText,
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    icon: Send,
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  'Email Delivered': {
    label: 'Email Delivered',
    icon: Mail,
    bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  'Offer Accepted': {
    label: 'Offer Accepted',
    icon: CheckCircle2,
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  'Account Pending': {
    label: 'Account Pending',
    icon: Clock,
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'Account Activated': {
    label: 'Account Activated',
    icon: ShieldCheck,
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  'Onboarding Completed': {
    label: 'Onboarding Completed',
    icon: Check,
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  },
  'Offer Rejected': {
    label: 'Offer Rejected',
    icon: XCircle,
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  'Email Failed': {
    label: 'Email Failed',
    icon: AlertCircle,
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  'Draft': {
    label: 'Draft',
    icon: FileText,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'Active': {
    label: 'Active',
    icon: CheckCircle2,
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  'Onboarding': {
    label: 'Onboarding',
    icon: Clock,
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

export default function StatusBadge({ status = 'Pending Offer', showIcon = true, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap shadow-2xs shrink-0 select-none transition-all',
        config.bg,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
      <span className="leading-none">{config.label}</span>
    </span>
  );
}
