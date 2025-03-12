
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Building2,
  FilePlus,
  Bell,
  Menu,
  X
} from "lucide-react";
import { mockRequests } from "@/lib/data";

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const pendingRequestsCount = mockRequests.filter(r => r.status === "Pending").length;

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
    
    // Add scroll listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { path: "/", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { path: "/sites", icon: <Building2 className="h-4 w-4" />, label: "Sites" },
    { path: "/insurance", icon: <FileText className="h-4 w-4" />, label: "Insurance Groups" },
    { path: "/requests", icon: <Bell className="h-4 w-4" />, label: "Requests", badge: pendingRequestsCount },
    { path: "/new-request", icon: <FilePlus className="h-4 w-4" />, label: "New Request" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md 
        ${scrolled ? "bg-white/80 shadow-sm" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
                InsuranceSync
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button 
                  variant={location.pathname === link.path ? "secondary" : "ghost"} 
                  size="sm"
                  className={`transition-all ${location.pathname === link.path ? 
                    "bg-secondary text-primary" : 
                    "hover:bg-secondary/50"}`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 shadow-lg">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button 
                  variant={location.pathname === link.path ? "secondary" : "ghost"} 
                  className={`w-full justify-start ${
                    location.pathname === link.path ? 
                    "bg-secondary text-primary" : 
                    ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
