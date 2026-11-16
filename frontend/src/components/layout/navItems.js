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
  Receipt,
  Banknote,
} from 'lucide-react'

export const navItems = [
  { label: 'Tableau de bord', path: '/app', icon: LayoutDashboard },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Avis', path: '/avis', icon: MessageSquare },
  { label: 'Chambres', path: '/chambres', icon: BedDouble },
  { label: 'Réservations', path: '/reservations', icon: ClipboardList },
  { label: 'Séjours', path: '/sejours', icon: ClipboardList },
  // Module Karima :
  { label: 'Services', path: '/services', icon: Sparkles },
  { label: 'Consommations', path: '/consommations', icon: Receipt },
  { label: 'Paiements', path: '/paiements', icon: CreditCard },
  { label: 'Résumé financier', path: '/resume-financier', icon: Banknote },
  { label: 'Employés', path: '/employes', icon: UserRound },
  // Autres modules :
  { label: 'Maintenances', path: '/maintenances', icon: Wrench },
]
