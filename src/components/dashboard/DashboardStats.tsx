
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Building2,
  Calendar,
  File,
  FileCheck,
  FileX,
  Users,
} from "lucide-react";
import { mockSites, mockInsuranceGroups, mockRequests, isExpiringSoon } from "@/lib/data";

const DashboardStats = () => {
  // Calculate statistics
  const totalSites = mockSites.length;
  const totalGroups = mockInsuranceGroups.length;
  const expiringGroups = mockInsuranceGroups.filter(group => isExpiringSoon(group.endDate)).length;
  const pendingRequests = mockRequests.filter(req => req.status === "Pending").length;

  // Calculate percentages
  const expiringPercentage = Math.round((expiringGroups / totalGroups) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border/50 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSites}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {totalGroups} insurance groups
          </p>
        </CardContent>
      </Card>
      
      <Card className="border border-border/50 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <Calendar className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{expiringGroups}</div>
          <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${expiringPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {expiringPercentage}% of policies expiring within 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card className="border border-border/50 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <File className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{pendingRequests}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                {mockRequests.filter(r => r.status === "Approved").length} Approved
              </span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1">
              <FileX className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">
                {mockRequests.filter(r => r.status === "Denied").length} Denied
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-border/50 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <AlertCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">Operational</div>
          <div className="flex items-center gap-1 mt-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">
              Last updated: March 11, 2025
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
