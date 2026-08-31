import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function AccountPreviewCard({
  employeeName = '',
  employeeId = '',
}) {
  const [copied, setCopied] = useState(false);

  const normalizedName = employeeName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') || 'candidate';
  const idNumber = employeeId.replace(/[^0-9]/g, '') || '001';
  const username = `${normalizedName}${idNumber}@dsprojects`;

  const handleCopy = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--color-primary)]" />
            Employee Portal Account Provisioning
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Auto-assigned corporate username and secure onboarding workflow.
          </p>
        </div>
        <span className="text-[10px] text-gray-400 font-mono font-medium">System Provisioned</span>
      </div>

      <div className="bg-gray-50/90 rounded-xl p-4 border border-gray-200 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-gray-500">Assigned Username:</span>
          <div className="flex items-center gap-2 font-mono text-[var(--color-primary)] font-bold text-sm bg-white px-3 py-1.5 rounded-lg border border-blue-200">
            <span>{username}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-[var(--color-primary)] rounded"
              title="Copy username"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1.5">
          <p className="flex items-center gap-2 text-gray-800 font-bold">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
            <span>Zero-Knowledge Passwordless Activation</span>
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            The candidate receives a single-use activation token via their verified email address upon dispatch. They establish their own password on first portal access.
          </p>
        </div>
      </div>
    </div>
  );
}
