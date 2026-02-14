import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  CheckSquare,
  Coins,
  Settings,
  LogOut,
  Users,
  Database,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/admin/programs', icon: FolderKanban, label: 'Programs' },
  { to: '/admin/milestones', icon: Target, label: 'Milestones' },
  { to: '/admin/submissions', icon: CheckSquare, label: 'Submissions' },
  { to: '/admin/rewards', icon: Coins, label: 'Rewards Queue' },
  { to: '/admin/settings', icon: Settings, label: 'Community Settings' },
  { to: '/admin/seed-data', icon: Database, label: 'Seed Demo Data' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
              <p className="text-xs text-slate-500">Community Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
