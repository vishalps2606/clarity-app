import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Target, Clock, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile State

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: Clock, label: 'Review', path: '/review' },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between p-4">
      <div>
        <div className="mb-8 px-2 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-neon-blue rounded-full blur-[10px] opacity-50 absolute" />
             <h1 className="text-xl font-bold font-mono text-neon-blue relative z-10">CLARITY_OS</h1>
           </div>
           {/* Close Button (Mobile Only) */}
           <button 
             onClick={() => setIsSidebarOpen(false)}
             className="md:hidden text-text-secondary hover:text-neon-red"
           >
             <X size={24} />
           </button>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Close on navigate
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-mono text-sm",
                  isActive 
                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]" 
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button 
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-neon-red/80 hover:text-neon-red hover:bg-neon-red/10 rounded-md transition-all font-mono text-sm"
      >
        <LogOut size={18} />
        Disconnect
      </button>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-void text-text-primary overflow-hidden">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 border-r border-border bg-surface/50 flex-col">
        <SidebarContent />
      </aside>

      {/* MOBILE HEADER (Visible on Mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/90 border-b border-border z-30 flex items-center justify-between px-4 backdrop-blur-md">
         <h1 className="text-lg font-bold font-mono text-neon-blue">CLARITY_OS</h1>
         <button onClick={() => setIsSidebarOpen(true)} className="text-text-primary">
           <Menu size={24} />
         </button>
      </div>

      {/* MOBILE DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface border-r border-border z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}