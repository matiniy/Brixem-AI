// This file only handles redirecting /dashboard to /dashboard/kitchen
import { redirect } from 'next/navigation';

export default function DashboardRootRedirect() {
  redirect('/dashboard/kitchen');
  return null;
} 