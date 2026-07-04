import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Vote,
  Users,
  BarChart3,
  Trophy,
  LogOut,
  ShieldCheck,
  Settings,
  MessageSquare,
} from 'lucide-react';

export default function AdminSidebar() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const adminNavItems = [
    { label: t('admin.sidebar.overview'), path: '/admin', icon: LayoutDashboard, exact: true },
    { label: t('admin.sidebar.elections'), path: '/admin/elections', icon: Vote },
    { label: t('admin.sidebar.candidates'), path: '/admin/candidates', icon: Users },
    { label: t('admin.sidebar.voters'), path: '/admin/voters', icon: ShieldCheck },
    { label: t('admin.sidebar.results'), path: '/admin/results', icon: Trophy },
    { label: t('admin.sidebar.support'), path: '/admin/support', icon: MessageSquare },
  ];

  return (
    <aside className="flex flex-col gap-2 h-full">
      {/* Admin Badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 shadow-sm mb-2">
        <Avatar className="h-10 w-10 border-2 border-red-300 dark:border-red-700">
          <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName} />
          <AvatarFallback className="bg-red-500 text-white font-bold text-sm">
            {clerkUser?.fullName?.[0]?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{clerkUser?.fullName || 'Admin'}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{t('admin.sidebar.role')}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-red-500 text-white shadow-sm shadow-red-200 dark:shadow-red-900/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* Back to Voter View */}
      <NavLink
        to="/dashboard"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      >
        <BarChart3 className="h-4 w-4 shrink-0" />
        {t('admin.sidebar.voter_dashboard')}
      </NavLink>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t('admin.sidebar.sign_out')}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3 px-2">{t('admin.sidebar.control_panel')}</p>
      </div>
    </aside>
  );
}
