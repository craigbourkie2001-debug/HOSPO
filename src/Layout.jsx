import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Coffee, Briefcase, Store, User, LogOut, Clock, LayoutDashboard, ChefHat, MessageCircle, Crown, Settings } from "lucide-react";
import NotificationBell from "./components/NotificationBell";
import HospoLogo from "./components/HospoLogo";
import WorkerOnboarding from "./components/onboarding/WorkerOnboarding";
import EmployerOnboarding from "./components/onboarding/EmployerOnboarding";
import RoleSelection from "./components/onboarding/RoleSelection";
import { base44 } from "@/api/base44Client";
import { Toaster } from "@/components/ui/sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const workerNavItems = [
  {
    title: "Browse Shifts",
    url: createPageUrl("BrowseShifts"),
    icon: Briefcase,
  },
  {
    title: "My Shifts",
    url: createPageUrl("MyShifts"),
    icon: Clock,
  },
  {
    title: "Jobs",
    url: createPageUrl("Jobs"),
    icon: Briefcase,
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageCircle,
  },
  {
    title: "My Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

const employerNavItems = [
  {
    title: "Employer Dashboard",
    url: createPageUrl("EmployerDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Employer Settings",
    url: createPageUrl("EmployerSettings"),
    icon: Settings,
  },
  {
    title: "Upgrade to Premium",
    url: createPageUrl("EmployerPremium"),
    icon: Crown,
  },
];

const generalNavItems = [
  {
    title: "Hospo+ Premium",
    url: createPageUrl("Premium"),
    icon: Crown,
  },
  {
    title: "Support Chat",
    url: createPageUrl("SupportChat"),
    icon: MessageCircle,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Don't show layout on Welcome page
  if (location.pathname.includes('/welcome')) {
    return children;
  }

  React.useEffect(() => {
    if (location.pathname.includes('/welcome')) return;
    
    base44.auth.me().then(userData => {
      setUser(userData);
      
      // If account_type not set, show role selection first
      if (!userData.account_type) {
        setShowOnboarding('role-selection');
      } else if (!userData.onboarding_completed) {
        // Show onboarding for their specific role
        if (userData.account_type === 'employer') {
          setShowOnboarding('employer');
        } else if (userData.account_type === 'worker') {
          setShowOnboarding('worker');
        }
      }
    }).catch(() => {});
  }, [location.pathname]);

  const isEmployer = user?.account_type === 'employer';
  const isWorker = user?.account_type === 'worker';

  const mobileNavItems = isEmployer
    ? [
        { title: "Dashboard", url: createPageUrl("EmployerDashboard"), icon: LayoutDashboard },
        { title: "Messages", url: createPageUrl("Messages"), icon: MessageCircle },
        { title: "Settings", url: createPageUrl("EmployerSettings"), icon: Settings },
      ]
    : [
        { title: "Shifts", url: createPageUrl("BrowseShifts"), icon: Briefcase },
        { title: "My Shifts", url: createPageUrl("MyShifts"), icon: Clock },
        { title: "Messages", url: createPageUrl("Messages"), icon: MessageCircle },
        { title: "Profile", url: createPageUrl("Profile"), icon: User },
      ];

  return (
    <SidebarProvider>
      <style>{`
      :root {
        --cream: #FAF8F5;
        --sand: #E8E3DC;
        --terracotta: #C89F8C;
        --clay: #8E8E93;
        --earth: #1C1C1E;
        --sage: #8A9B8E;
        --olive: #6B7565;
        --warm-white: #FFFCF7;
      }

      @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&display=swap');

      body {
        font-family: 'Crimson Pro', Georgia, serif;
        overscroll-behavior: none;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        -webkit-font-smoothing: antialiased;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: 'Crimson Pro', Georgia, serif;
        letter-spacing: -0.01em;
      }

      .hover-lift {
        transition: transform 0.15s ease, opacity 0.15s ease;
      }

      .hover-lift:hover {
        transform: translateY(-1px);
      }

      button, [role="tab"], [role="button"], .sidebar-item, 
      .mobile-nav-item, [role="tablist"], .badge, .filter-badge,
      .no-select {
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }

      .mobile-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(60, 60, 67, 0.12);
        display: flex;
        justify-content: space-around;
        padding: env(safe-area-inset-bottom, 12px) 0 12px 0;
        z-index: 50;
      }

      @media (min-width: 768px) {
        .mobile-bottom-nav {
          display: none;
        }
      }

      .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 8px 12px;
        color: #8E8E93;
        text-decoration: none;
        font-size: 11px;
        font-weight: 500;
        user-select: none;
      }

      .mobile-nav-item.active {
        color: var(--terracotta);
      }

      .mobile-content-padding {
        padding-bottom: 84px;
      }

      @media (min-width: 768px) {
        .mobile-content-padding {
          padding-bottom: 0;
        }
      }

      input, select, textarea, button {
        min-height: 44px;
      }

      .mobile-page-header {
        padding-top: calc(env(safe-area-inset-top) + 4rem);
      }

      @media (min-width: 768px) {
        .mobile-page-header {
          padding-top: 3rem;
        }
      }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--cream)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'rgba(60,60,67,0.12)', backgroundColor: 'var(--warm-white)' }}>
          <SidebarHeader className="border-b p-6" style={{ borderColor: 'rgba(60,60,67,0.12)' }}>
            <div className="flex items-center justify-between">
              <HospoLogo size="md" />
              <NotificationBell />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            {/* Worker Section — only shown to workers or unauthenticated users */}
            {!isEmployer && (
            <SidebarGroup>
              <div className="px-4 py-2 text-xs tracking-widest font-normal" style={{ color: 'var(--clay)' }}>
                FOR WORKERS
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {workerNavItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="rounded-lg mb-1 transition-all duration-300 hover-lift"
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            style={{
                              backgroundColor: isActive ? 'var(--sand)' : 'transparent',
                              color: isActive ? 'var(--earth)' : 'var(--clay)'
                            }}
                          >
                            <item.icon className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
                            <span className="font-normal tracking-wide text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            )}

            {/* Employer Section — only shown to employers */}
            {isEmployer && (
            <SidebarGroup>
              <div className="px-4 py-2 text-xs tracking-widest font-normal" style={{ color: 'var(--clay)' }}>
                FOR EMPLOYERS
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {employerNavItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="rounded-lg mb-1 transition-all duration-300 hover-lift"
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            style={{
                              backgroundColor: isActive ? 'var(--sand)' : 'transparent',
                              color: isActive ? 'var(--earth)' : 'var(--clay)'
                            }}
                          >
                            <item.icon className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
                            <span className="font-normal tracking-wide text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            )}

            {/* General Section — only for workers */}
            {!isEmployer && <SidebarGroup className="mt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  {generalNavItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="rounded-lg mb-1 transition-all duration-300 hover-lift"
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            style={{
                              backgroundColor: isActive ? 'var(--sand)' : 'transparent',
                              color: isActive ? 'var(--earth)' : 'var(--clay)'
                            }}
                          >
                            <item.icon className="w-5 h-5" style={{ strokeWidth: 1.5 }} />
                            <span className="font-normal tracking-wide text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>}

            {user && !isEmployer && (
              <div className="mx-2 mt-6 p-5 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--terracotta)' }} />
                    <span className="text-sm font-normal" style={{ color: 'var(--earth)' }}>This Week</span>
                  </div>
                  <span className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                    {user.hours_worked_this_week || 0}h
                  </span>
                </div>
                <div className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>
                  {user.weekly_hours_limit ? `of ${user.weekly_hours_limit}h limit` : 'No limit set'}
                </div>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{ borderColor: 'rgba(60,60,67,0.12)' }}>
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                  {user.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-light text-white text-lg flex-shrink-0" style={{ backgroundColor: 'var(--terracotta)' }}>
                      {(user.legal_first_name || user.full_name)?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-normal text-sm truncate" style={{ color: 'var(--earth)' }}>
                      {(user.legal_first_name && user.legal_last_name)
                        ? `${user.legal_first_name} ${user.legal_last_name}`
                        : user.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--clay)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    base44.auth.logout();
                    window.location.href = createPageUrl('Welcome');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-normal tracking-wide transition-all duration-300 hover-lift"
                  style={{ backgroundColor: 'var(--earth)', color: 'white' }}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 md:hidden" style={{ backgroundColor: 'var(--warm-white)', borderColor: 'var(--sand)' }}>
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="p-2 rounded-lg transition-all duration-200" />
                <HospoLogo size="sm" />
              </div>
              <NotificationBell />
            </div>
          </header>

          <div className="flex-1 overflow-auto mobile-content-padding">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link 
                key={item.title}
                to={item.url} 
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-6 h-6" style={{ strokeWidth: 1.5 }} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Onboarding Modals */}
        {showOnboarding === 'role-selection' && user && (
          <RoleSelection
            user={user}
            onComplete={() => {
              setShowOnboarding(false);
              base44.auth.me().then(userData => {
                setUser(userData);
                // Trigger onboarding for the selected role
                if (userData.account_type === 'employer') {
                  setShowOnboarding('employer');
                } else if (userData.account_type === 'worker') {
                  setShowOnboarding('worker');
                }
              }).catch(() => {});
            }}
          />
        )}
        {showOnboarding === 'worker' && user && (
          <WorkerOnboarding 
            user={user} 
            onComplete={() => {
              setShowOnboarding(false);
              window.location.href = createPageUrl('BrowseShifts');
            }} 
          />
        )}
        {showOnboarding === 'employer' && user && (
          <EmployerOnboarding 
            user={user} 
            onComplete={() => {
              setShowOnboarding(false);
              window.location.href = createPageUrl('EmployerDashboard');
            }} 
          />
        )}
      </div>
    </SidebarProvider>
  );
}