import type { Metric, NavItem, Report, User } from '~/types/dashboard'

export const useDashboardData = () => {
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: 'LayoutDashboard',
      priority: 'high',
      roles: ['manager', 'partner', 'visitor']
    },
    {
      label: 'User Profile',
      path: '/profile',
      icon: 'UserCircle',
      priority: 'high',
      roles: ['manager', 'partner', 'visitor']
    },
    { label: 'User Management', path: '/users', icon: 'Users', priority: 'high', roles: ['manager'] },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: 'ChartNoAxesCombined',
      priority: 'medium',
      roles: ['manager', 'partner']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'FileBarChart',
      priority: 'medium',
      roles: ['manager', 'partner', 'visitor']
    },
    { label: 'Settings', path: '/settings', icon: 'Settings', priority: 'medium', roles: ['manager'] }
  ]

  const metrics: Metric[] = [
    { label: 'Revenue', value: '$128.4K', trend: '+12.8% this month', icon: 'DollarSign' },
    { label: 'Active Users', value: '24,891', trend: '+2,143 this week', icon: 'Users' },
    { label: 'Conversion', value: '8.7%', trend: '+1.4 pts', icon: 'TrendingUp' },
    { label: 'Open Tickets', value: '38', trend: '14 resolved today', icon: 'CircleHelp' }
  ]

  const users: User[] = [
    { id: 1, name: 'Maya Chen', email: 'maya@company.com', role: 'Admin', status: 'Active', lastSeen: 'Today' },
    { id: 2, name: 'Jon Bell', email: 'jon@company.com', role: 'Analyst', status: 'Active', lastSeen: 'Yesterday' },
    { id: 3, name: 'Ari Patel', email: 'ari@company.com', role: 'Manager', status: 'Pending', lastSeen: 'Invited' },
    { id: 4, name: 'Nora Kim', email: 'nora@company.com', role: 'Viewer', status: 'Active', lastSeen: 'May 6' }
  ]

  const reports: Report[] = [
    { id: 1, name: 'Executive KPI Summary', owner: 'Maya Chen', cadence: 'Weekly', status: 'Ready' },
    { id: 2, name: 'Acquisition Funnel', owner: 'Jon Bell', cadence: 'Daily', status: 'Ready' },
    { id: 3, name: 'Retention Cohorts', owner: 'Ari Patel', cadence: 'Monthly', status: 'Draft' }
  ]

  const weeklyTraffic = [
    { label: 'Mon', value: 54 },
    { label: 'Tue', value: 68 },
    { label: 'Wed', value: 75 },
    { label: 'Thu', value: 62 },
    { label: 'Fri', value: 88 },
    { label: 'Sat', value: 42 },
    { label: 'Sun', value: 57 }
  ]

  return { metrics, navItems, reports, users, weeklyTraffic }
}
