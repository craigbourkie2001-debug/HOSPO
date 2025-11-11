import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Coffee, Briefcase, Store, Award, User, LogOut } from "lucide-react";
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
    title: "Roasters",
    url: createPageUrl("Roasters"),
    icon: Award,
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
        :root {
          --espresso: #3D2817;
          --coffee-brown: #5C4033;
          --cream: #F5F1E8;
          --latte: #E8DCC4;
          --fresh-green: #6B8E23;
          --warm-white: #FDFBF7;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--warm-white)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--latte)' }}>
          <SidebarHeader className="border-b p-6" style={{ borderColor: 'var(--latte)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--espresso), var(--coffee-brown))' }}>
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: 'var(--espresso)' }}>Bean</h2>
                <p className="text-xs" style={{ color: 'var(--coffee-brown)' }}>Specialty Coffee Network</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl mb-2 transition-all duration-300 ${
                          location.pathname === item.url 
                            ? 'shadow-sm' 
                            : 'hover:shadow-sm'
                        }`}
                        style={{
                          backgroundColor: location.pathname === item.url ? 'var(--latte)' : 'transparent',
                          color: location.pathname === item.url ? 'var(--espresso)' : 'var(--coffee-brown)'
                        }}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{ borderColor: 'var(--latte)' }}>
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: 'var(--fresh-green)' }}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--espresso)' }}>
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--coffee-brown)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-sm"
                  style={{ backgroundColor: 'var(--latte)', color: 'var(--espresso)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 md:hidden" style={{ backgroundColor: 'white', borderColor: 'var(--latte)' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg transition-colors duration-200" style={{ hover: { backgroundColor: 'var(--latte)' } }} />
              <div className="flex items-center gap-2">
                <Coffee className="w-6 h-6" style={{ color: 'var(--espresso)' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--espresso)' }}>Bean</h1>
              </div>
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