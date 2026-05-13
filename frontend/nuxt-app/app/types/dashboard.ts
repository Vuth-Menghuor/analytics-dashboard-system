export type NavItem = {
  label: string
  path: string
  icon: string
  priority: 'high' | 'medium'
  roles: Array<'manager' | 'partner' | 'visitor'>
}

export type Metric = {
  label: string
  value: string
  trend: string
  icon: string
  color?: string
  sparkline?: number[]
}

export type User = {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Pending' | 'Suspended'
  lastSeen: string
}

export type Report = {
  id: number
  name: string
  owner: string
  cadence: string
  status: 'Ready' | 'Draft'
}

export type WeeklyTrafficPoint = {
  label: string
  value: number
}

export type GenderInstitution = {
  institution: string
  male: number
  female: number
  total: number
  malePercent: number
  femalePercent: number
}
