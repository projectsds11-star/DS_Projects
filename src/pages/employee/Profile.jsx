import React, { useState } from 'react';
import { User, Edit, Camera, Phone, Mail, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';

export default function EmployeeProfile() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">My Profile</h1>
          <p className="text-[var(--color-text-secondary)]">View and manage your personal information.</p>
        </div>
        <Button variant={editing ? 'outline' : 'default'} onClick={() => setEditing(!editing)} icon={Edit}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-[var(--color-lavender)] flex items-center justify-center text-3xl font-bold text-[var(--color-navy)]">
                R
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[var(--color-navy)]">Rahul Kumar</h2>
              <p className="text-gray-500 text-sm mt-1">Mandal Co-ordinator · Kavali, Nellore</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="success">Active</Badge>
                <Badge variant="secondary">DS-127</Badge>
                <Badge variant="secondary">Joined: Jan 15, 2025</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" />Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {editing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="Rahul" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" defaultValue="1995-06-15" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            ) : (
              <dl className="space-y-4 text-sm">
                {[
                  { label: 'Full Name', value: 'Rahul Kumar' },
                  { label: 'Date of Birth', value: 'June 15, 1995' },
                  { label: 'Gender', value: 'Male' },
                  { label: 'Designation', value: 'Mandal Co-ordinator' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <dt className="text-gray-500">{item.label}</dt>
                    <dd className="font-medium text-gray-800 text-right">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4" />Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue="rahul.kumar@dsprojects.in" />
                </div>
                <div className="space-y-2">
                  <Label>Home Address</Label>
                  <textarea rows={2} defaultValue="12-4, Nellore Town, Andhra Pradesh - 524001" className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                </div>
              </div>
            ) : (
              <dl className="space-y-4 text-sm">
                {[
                  { label: 'Mobile', value: '+91 98765 43210', icon: Phone },
                  { label: 'Email', value: 'rahul.kumar@dsprojects.in', icon: Mail },
                  { label: 'Address', value: '12-4, Nellore Town, AP - 524001', icon: MapPin },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs">{item.label}</p>
                        <p className="font-medium text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Government IDs - read only */}
        <Card>
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Government IDs</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="space-y-4 text-sm">
              {[
                { label: 'Aadhaar Number', value: '1234 •••• •••• 5678' },
                { label: 'PAN Number', value: 'ABCDE••••F' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-mono font-medium text-gray-800">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-400 mt-4">Contact HR to update government ID information.</p>
          </CardContent>
        </Card>

        {/* Bank Details - read only */}
        <Card>
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="space-y-4 text-sm">
              {[
                { label: 'Account Holder', value: 'Rahul Kumar' },
                { label: 'Account Number', value: '•••• •••• 4321' },
                { label: 'IFSC Code', value: 'SBIN0001234' },
                { label: 'Bank Name', value: 'State Bank of India' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-800">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-400 mt-4">Contact HR to update bank information.</p>
          </CardContent>
        </Card>
      </div>

      {editing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={() => setEditing(false)}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
