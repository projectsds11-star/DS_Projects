import React from 'react';
import { Users, UserCheck, UserPlus, ClipboardList, FileClock, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-[var(--color-text-secondary)]">
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-3xl font-bold text-[var(--color-navy)]">{value}</div>
        {trend && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            <span className={trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>{' '}
            from last month
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Good Morning, Admin</h1>
          <p className="text-[var(--color-text-secondary)]">{currentDate}</p>
        </div>
        <div className="flex space-x-2">
          {/* Action buttons could go here */}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Employees" 
          value="1,248" 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
          colorClass="bg-[var(--color-primary)] text-[var(--color-primary)]" 
        />
        <StatCard 
          title="Active Employees" 
          value="1,180" 
          icon={UserCheck} 
          trend="up" 
          trendValue="8%" 
          colorClass="bg-[var(--color-success)] text-[var(--color-success)]" 
        />
        <StatCard 
          title="Pending Onboarding" 
          value="42" 
          icon={UserPlus} 
          trend="down" 
          trendValue="4%" 
          colorClass="bg-[var(--color-warning)] text-[var(--color-warning)]" 
        />
        <StatCard 
          title="Today's Work" 
          value="856" 
          icon={ClipboardList} 
          colorClass="bg-[var(--color-info)] text-[var(--color-info)]" 
        />
        <StatCard 
          title="Pending Work Sheets" 
          value="124" 
          icon={FileClock} 
          colorClass="bg-[var(--color-error)] text-[var(--color-error)]" 
        />
        <StatCard 
          title="Today's Attendance" 
          value="94%" 
          icon={CalendarCheck} 
          trend="up" 
          trendValue="2%" 
          colorClass="bg-[var(--color-primary)] text-[var(--color-primary)]" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Recent Onboarding Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-lavender)] flex items-center justify-center text-[var(--color-navy)] font-semibold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New Candidate {i}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Offer letter sent • 2 hours ago
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-[var(--color-text-secondary)]">
                    DS-10{i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card className="lg:col-span-3">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-4">Work Overview</h3>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Completed</span>
                    <span className="text-[var(--color-success)] font-semibold">68%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-success)] w-[68%] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">In Progress</span>
                    <span className="text-[var(--color-info)] font-semibold">22%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-info)] w-[22%] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Pending Review</span>
                    <span className="text-[var(--color-warning)] font-semibold">10%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-warning)] w-[10%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
