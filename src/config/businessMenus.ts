import { BusinessType } from '@/context/BusinessTypeContext';
import {
  Home,
  Users,
  Dumbbell,
  CreditCard,
  MessageSquare,
  Bell,
  Package,
  LayoutDashboard,
  LogIn,
  BookOpen,
  Settings,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  showNotificationBadge?: boolean;
}

// Items comunes a todos los tipos de negocio
const commonItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', path: '/', icon: Home },
];

// Items comunes al final del menu
const commonEndItems: MenuItem[] = [
  { id: 'whatsapp', label: 'WhatsApp', path: '/assistant', icon: MessageSquare, showNotificationBadge: true },
  { id: 'notificaciones', label: 'Notificaciones', path: '/notifications', icon: Bell, showNotificationBadge: true },
];

// Items especificos por tipo de negocio
const gymItems: MenuItem[] = [
  { id: 'gym-dashboard', label: 'Dashboard Gym', path: '/gym/dashboard', icon: LayoutDashboard },
  { id: 'checkins', label: 'Check-ins', path: '/gym/checkins', icon: LogIn },
  { id: 'miembros', label: 'Miembros', path: '/gym/members', icon: Users },
  { id: 'planes', label: 'Planes', path: '/gym/plans', icon: Package },
  { id: 'clases', label: 'Clases', path: '/gym/classes', icon: Dumbbell },
  { id: 'pagos', label: 'Pagos', path: '/gym/payments', icon: CreditCard },
  { id: 'docs', label: 'Documentacion', path: '/gym/docs', icon: BookOpen },
  { id: 'settings', label: 'Configuracion', path: '/settings', icon: Settings },
];

// Hotel and habits disabled - only gym enabled for now
const hotelItems: MenuItem[] = [];
const habitsItems: MenuItem[] = [];

const itemsByBusinessType: Record<Exclude<BusinessType, null>, MenuItem[]> = {
  gym: gymItems,
  hotel: hotelItems,
  habits: habitsItems,
};

export const getMenuItems = (businessType: BusinessType): MenuItem[] => {
  if (!businessType) {
    return [...commonItems, ...commonEndItems];
  }

  const specificItems = itemsByBusinessType[businessType] || [];
  return [...commonItems, ...specificItems, ...commonEndItems];
};

export const businessTypeLabels: Record<Exclude<BusinessType, null>, string> = {
  gym: 'Gimnasio',
  hotel: 'Hoteleria',
  habits: 'Habitos',
};
