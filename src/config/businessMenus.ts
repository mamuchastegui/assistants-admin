import { BusinessType } from '@/context/BusinessTypeContext';
import {
  Home,
  Calendar,
  Users,
  Dumbbell,
  CreditCard,
  MessageSquare,
  Bell,
  Hotel,
  BedDouble,
  Target,
  TrendingUp,
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
  { id: 'calendario', label: 'Calendario', path: '/calendar', icon: Calendar },
];

// Items comunes al final del menu
const commonEndItems: MenuItem[] = [
  { id: 'whatsapp', label: 'WhatsApp', path: '/assistant', icon: MessageSquare, showNotificationBadge: true },
  { id: 'notificaciones', label: 'Notificaciones', path: '/notifications', icon: Bell, showNotificationBadge: true },
];

// Items especificos por tipo de negocio
const gymItems: MenuItem[] = [
  { id: 'miembros', label: 'Miembros', path: '/gym/members', icon: Users },
  { id: 'clases', label: 'Clases', path: '/gym/classes', icon: Dumbbell },
  { id: 'pagos', label: 'Pagos', path: '/gym/payments', icon: CreditCard },
];

const hotelItems: MenuItem[] = [
  { id: 'reservas', label: 'Reservas', path: '/hotel/reservations', icon: Calendar },
  { id: 'habitaciones', label: 'Habitaciones', path: '/hotel/rooms', icon: BedDouble },
];

const habitsItems: MenuItem[] = [
  { id: 'habitos', label: 'Habitos', path: '/habits/list', icon: Target },
  { id: 'progreso', label: 'Progreso', path: '/habits/progress', icon: TrendingUp },
];

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
