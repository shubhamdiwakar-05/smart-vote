import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useAdminCheck } from '../hooks/useAdminCheck';
import {
  LayoutDashboard,
  ScrollText,
  CheckSquare,
  BarChart2,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const voterItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Elections', path: '/elections', icon: ScrollText },
  { label: 'Cast Vote', path: '/vote', icon: CheckSquare },
  { label: 'Results', path: '/results', icon: BarChart2 },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="flex flex-col gap-2 h-full">
      {/* Profile Block */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm mb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {clerkUser?.fullName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{clerkUser?.fullName || 'Voter'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {clerkUser?.primaryEmailAddress?.emailAddress || ''}
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 tour-sidebar-nav">
        {voterItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
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

      {/* Admin Panel Link — only shown to admins */}
      {isAdmin && (
        <>
          <div className="border-t border-border my-2" />
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`
            }
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin Panel
          </NavLink>
        </>
      )}

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3 px-2">Secure citizen platform</p>
      </div>
    </aside>
  );
}
