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
  breakdown?: Array<{
    label: string
    value: string
  }>
  change?: string
  changePeriod?: string
  changeDirection?: 'up' | 'down' | 'neutral'
  sparkline?: number[]
}
