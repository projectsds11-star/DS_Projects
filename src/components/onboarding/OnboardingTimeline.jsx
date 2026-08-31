import React from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function OnboardingTimeline({ events = [], className }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-[var(--color-border)]">
        No onboarding activity recorded yet.
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-xs', className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-navy)] mb-6 flex items-center gap-2">
        <span>Onboarding Journey & Activity Log</span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
        {events.map((event, index) => {
          const isDone = event.completed;
          const isCurrent = !isDone && (index === 0 || events[index - 1]?.completed);

          return (
            <div key={index} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={cn(
                  'absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all shadow-xs',
                  isDone && 'bg-green-600 text-white ring-4 ring-green-100',
                  isCurrent && 'bg-[var(--color-primary)] text-white ring-4 ring-blue-100 animate-pulse',
                  !isDone && !isCurrent && 'bg-gray-200 text-gray-400'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Circle className="h-2 w-2" />
                )}
              </div>

              {/* Event Content */}
              <div className="bg-gray-50/70 group-hover:bg-blue-50/30 p-3.5 rounded-lg border border-gray-100 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <p
                    className={cn(
                      'text-xs font-bold',
                      isDone ? 'text-gray-900' : isCurrent ? 'text-[var(--color-primary)]' : 'text-gray-400'
                    )}
                  >
                    {event.title}
                  </p>
                  {event.date && (
                    <span className="text-[11px] font-mono text-gray-400">{event.date}</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
