import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  ScrollText,
  CheckSquare,
  BarChart2,
  User,
  LogOut,
} from 'lucide-react';

const items = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Elections', path: '/elections', icon: ScrollText },
  { label: 'Cast Vote', path: '/vote', icon: CheckSquare },
  { label: 'Results', path: '/results', icon: BarChart2 },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="flex flex-col gap-2 h-full">
      {/* Profile Block */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm mb-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{user?.name || 'Guest'}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.voter_id || 'No Voter ID'}</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
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
