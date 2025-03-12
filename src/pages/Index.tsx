
import { motion } from "framer-motion";
import NavBar from "@/components/navigation/NavBar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, Calendar, File, FilePlus, ArrowRight } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { mockSites, mockInsuranceGroups, formatDate, isExpiringSoon, getSiteInsuranceGroup } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  // Filter data for dashboard views
  const expiringSites = mockSites
    .filter(site => {
      const group = getSiteInsuranceGroup(site.id);
      return group && isExpiringSoon(group.endDate);
    })
    .slice(0, 5);

  const recentGroups = [...mockInsuranceGroups]
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NavBar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <section className="text-center space-y-4 mb-8">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">InsuranceSync</span>
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Manage site insurance details, track renewal dates, and process insurance requests in one unified platform
            </motion.p>
          </section>

          {/* Stats Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DashboardStats />
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <QuickActionCard 
              title="Manage Sites"
              description="Add, edit, or delete site information"
              icon={<Building2 className="h-6 w-6" />}
              to="/sites"
            />
            <QuickActionCard 
              title="Insurance Groups"
              description="Manage providers and renewal dates"
              icon={<Calendar className="h-6 w-6" />}
              to="/insurance"
            />
            <QuickActionCard 
              title="Request Dashboard"
              description="Review and process insurance requests"
              icon={<File className="h-6 w-6" />}
              to="/requests"
            />
            <QuickActionCard 
              title="New Request"
              description="Submit a request for new insurance"
              icon={<FilePlus className="h-6 w-6" />}
              to="/new-request"
            />
          </motion.section>

          {/* Expiring Insurance Sites */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold tracking-tight">Sites with Expiring Insurance</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/sites" className="flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
            
            <DataTable 
              data={expiringSites}
              columns={[
                {
                  header: "Site Name",
                  accessorKey: "name",
                  enableSorting: true,
                },
                {
                  header: "Address",
                  accessorKey: "address",
                  enableSorting: true,
                },
                {
                  header: "Provider",
                  accessorKey: (row) => {
                    const group = getSiteInsuranceGroup(row.id);
                    return group ? group.provider : "—";
                  },
                },
                {
                  header: "End Date",
                  accessorKey: (row) => {
                    const group = getSiteInsuranceGroup(row.id);
                    if (!group) return "—";
                    
                    const dateStr = formatDate(group.endDate);
                    
                    return (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">Expiring Soon</Badge>
                        <span>{dateStr}</span>
                      </div>
                    );
                  },
                },
              ]}
              keyField="id"
              searchFields={["name", "address"]}
            />
          </motion.section>

          {/* Recent Insurance Groups */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold tracking-tight">Recent Insurance Groups</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/insurance" className="flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
            
            <DataTable 
              data={recentGroups}
              columns={[
                {
                  header: "ID",
                  accessorKey: "id",
                  enableSorting: true,
                  className: "w-[80px]",
                },
                {
                  header: "Provider",
                  accessorKey: "provider",
                  enableSorting: true,
                },
                {
                  header: "End Date",
                  accessorKey: (row) => {
                    const dateStr = formatDate(row.endDate);
                    const expiring = isExpiringSoon(row.endDate);
                    
                    return (
                      <div className="flex items-center gap-2">
                        {expiring ? (
                          <Badge variant="destructive">Expiring Soon</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                        <span>{dateStr}</span>
                      </div>
                    );
                  },
                },
              ]}
              keyField="id"
              searchFields={["id", "provider"]}
            />
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  to 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  to: string;
}) => (
  <Link to={to}>
    <div className="border border-border/50 bg-white/60 backdrop-blur-sm rounded-lg p-5 hover:shadow-md transition-all hover:bg-white/80 h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4 p-2 w-fit rounded-md bg-blue-100 text-blue-500">
          {icon}
        </div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto pt-4">
          <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-500">
            <span className="flex items-center">
              Go to {title.toLowerCase()} <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  </Link>
);

export default Index;
