import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Coffee, Briefcase, Store, User, LogOut, Clock, LayoutDashboard } from "lucide-react";
import NotificationBell from "./components/NotificationBell";
import { base44 } from "@/api/base44Client";
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

const navigationItems = [
  {
    title: "Browse Shifts",
    url: createPageUrl("BrowseShifts"),
    icon: Briefcase,
  },
  {
    title: "My Shifts",
    url: createPageUrl("MyShifts"),
    icon: Coffee,
  },
  {
    title: "Coffee Shops",
    url: createPageUrl("CoffeeShops"),
    icon: Store,
  },
  {
    title: "Employer Dashboard",
    url: createPageUrl("EmployerDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <SidebarProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --cream: #FAF8F5;
          --sand: #E8E3DC;
          --terracotta: #C89F8C;
          --clay: #A67C6D;
          --earth: #705D56;
          --sage: #8A9B8E;
          --olive: #6B7565;
          --warm-white: #FFFCF7;
        }
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Crimson Pro', serif;
          font-weight: 400;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--cream)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <SidebarHeader className="border-b p-8" style={{ borderColor: 'var(--sand)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-light text-2xl tracking-wide" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Bean</h2>
                  <p className="text-xs tracking-wider" style={{ color: 'var(--clay)' }}>SPECIALTY COFFEE</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
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

            {user && (
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

          <SidebarFooter className="border-t p-4" style={{ borderColor: 'var(--sand)' }}>
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--sand)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-light text-white text-lg" style={{ backgroundColor: 'var(--terracotta)' }}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-normal text-sm truncate" style={{ color: 'var(--earth)' }}>
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--clay)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
                    <Coffee className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-light tracking-wide" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Bean</h1>
                </div>
              </div>
              <NotificationBell />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}