import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Coffee, Briefcase, Store, Award, User, LogOut, ShoppingBag, Calendar, Gift } from "lucide-react";
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
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "My Shifts",
    url: createPageUrl("MyShifts"),
    icon: Coffee,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Coffee Shops",
    url: createPageUrl("CoffeeShops"),
    icon: Store,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Roasters",
    url: createPageUrl("Roasters"),
    icon: Award,
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    title: "Marketplace",
    url: createPageUrl("Marketplace"),
    icon: ShoppingBag,
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "Events",
    url: createPageUrl("Events"),
    icon: Calendar,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "My Profile",
    url: createPageUrl("Profile"),
    icon: User,
    gradient: "from-green-500 to-emerald-500",
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
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animated-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Sidebar className="border-r border-purple-200 glass-effect">
          <SidebarHeader className="border-b border-purple-200 p-6 animated-gradient">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white drop-shadow-lg">Bean</h2>
                <p className="text-xs text-white/90 drop-shadow">Specialty Coffee Network</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`rounded-2xl mb-2 transition-all duration-300 hover-lift ${
                            isActive ? 'shadow-lg' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3 relative overflow-hidden group">
                            {isActive && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20`} />
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${item.gradient} shadow-md`}>
                              <item.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
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

            {user && user.loyalty_points > 0 && (
              <div className="mx-3 mt-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5" />
                  <span className="font-bold text-lg">{user.loyalty_points}</span>
                </div>
                <div className="text-xs text-white/90">Loyalty Points</div>
                <div className="text-xs text-white/80 mt-1">
                  {user.membership_tier?.toUpperCase()} Member
                </div>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-200 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl glass-effect">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-gray-900">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs truncate text-gray-600">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover-lift bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-purple-200 px-6 py-4 md:hidden glass-effect">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-xl transition-all duration-200 hover:bg-purple-100" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Bean</h1>
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