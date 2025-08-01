// This file only handles redirecting /dashboard to /dashboard/homeowner
import { redirect } from 'next/navigation';

export default function DashboardRootRedirect() {
  redirect('/dashboard/homeowner');
  return null;
} 