import {
  BedDouble,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react'

export const navItems = [
  { label: 'Tableau de bord', path: '/', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Avis', path: '/avis', icon: MessageSquare },
  { label: 'Chambres', path: '/chambres', icon: BedDouble },
  { label: 'Reservations', path: '/reservations', icon: ClipboardList },
  { label: 'Sejours', path: '/sejours', icon: ClipboardList },
  { label: 'Services', path: '/services', icon: Sparkles },
  { label: 'Paiements', path: '/paiements', icon: CreditCard },
  { label: 'Employes', path: '/employes', icon: UserRound },
  { label: 'Maintenances', path: '/maintenances', icon: Wrench },
]
