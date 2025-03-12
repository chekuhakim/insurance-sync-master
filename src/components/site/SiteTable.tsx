import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Pencil, Trash } from "lucide-react";
import { Site, InsuranceGroup, formatDate, isExpiringSoon } from "@/lib/data";
import SiteForm from "./SiteForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SiteTable = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [insuranceGroups, setInsuranceGroups] = useState<InsuranceGroup[]>([]);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    fetchSites();
    fetchInsuranceGroups();
  }, []);
  
  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*');
      
      if (error) throw error;
      
      const formattedSites: Site[] = data.map((site, index) => ({
        id: index + 1,
        name: site.name,
        address: site.address,
        insuranceGroupId: site.insurance_group_id ? parseInt(site.insurance_group_id.toString().replace(/\D/g, '').slice(-1)) : 0,
        originalId: site.id // This is now valid with the updated Site type
      }));
      
      setSites(formattedSites);
    } catch (error: any) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInsuranceGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_groups')
        .select('*');
      
      if (error) throw error;
      
      const formattedGroups: InsuranceGroup[] = data.map((group, index) => ({
        id: index + 1,
        provider: group.provider,
        endDate: new Date(group.end_date),
        originalId: group.id // This is now valid with the updated InsuranceGroup type
      }));
      
      setInsuranceGroups(formattedGroups);
    } catch (error: any) {
      console.error('Error fetching insurance groups:', error);
      toast.error('Failed to load insurance groups');
    }
  };
  
  const handleSave = async (site: Site) => {
    try {
      if (editingSite) {
        const { error } = await supabase
          .from('sites')
          .update({
            name: site.name,
            address: site.address,
            insurance_group_id: site.insuranceGroupId ? 
              insuranceGroups.find(g => g.id === site.insuranceGroupId)?.originalId : null
          })
          .eq('id', editingSite.originalId);
        
        if (error) throw error;
        
        setSites(sites.map(s => s.id === site.id ? {
          ...site,
          originalId: editingSite.originalId // Preserve the originalId
        } : s));
        
        toast.success('Site updated successfully');
      } else {
        const { data, error } = await supabase
          .from('sites')
          .insert({
            name: site.name,
            address: site.address,
            insurance_group_id: site.insuranceGroupId ? 
              insuranceGroups.find(g => g.id === site.insuranceGroupId)?.originalId : null
          })
          .select();
        
        if (error) throw error;
        
        const newId = Math.max(0, ...sites.map(s => s.id)) + 1;
        setSites([...sites, { 
          ...site, 
          id: newId,
          originalId: data[0].id // Add the new Supabase UUID
        }]);
        
        toast.success('Site added successfully');
      }
    } catch (error: any) {
      console.error('Error saving site:', error);
      toast.error('Failed to save site');
    } finally {
      setEditingSite(null);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const siteToDelete = sites.find(site => site.id === id);
      if (!siteToDelete || !siteToDelete.originalId) return;
      
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteToDelete.originalId);
      
      if (error) throw error;
      
      setSites(sites.filter(site => site.id !== id));
      toast.success('Site deleted successfully');
    } catch (error: any) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    } finally {
      setIsDeleting(null);
    }
  };
  
  const getSiteInsuranceGroup = (siteId: number) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return null;
    
    return insuranceGroups.find(group => group.id === site.insuranceGroupId);
  };
  
  const columns = [
    {
      header: "Site Name",
      accessorKey: "name" as keyof Site,
      enableSorting: true,
    },
    {
      header: "Address",
      accessorKey: "address" as keyof Site,
      enableSorting: true,
    },
    {
      header: "Insurance Provider",
      accessorKey: (row: Site) => {
        const group = getSiteInsuranceGroup(row.id);
        return group ? group.provider : "—";
      },
      enableSorting: true,
    },
    {
      header: "End Date",
      accessorKey: (row: Site) => {
        const group = getSiteInsuranceGroup(row.id);
        if (!group) return "—";
        
        const dateStr = formatDate(group.endDate);
        const expiring = isExpiringSoon(group.endDate);
        
        return (
          <div className="flex items-center gap-2">
            {expiring ? (
              <Badge variant="destructive" className="animate-pulse">Expiring Soon</Badge>
            ) : null}
            <span>{dateStr}</span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: (row: Site) => (
        <div className="flex items-center gap-2 justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setEditingSite(row)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Site</DialogTitle>
              </DialogHeader>
              <SiteForm 
                site={row} 
                insuranceGroups={insuranceGroups}
                onSave={handleSave}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleting === row.id} onOpenChange={(open) => !open && setIsDeleting(null)}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 border-destructive/20 hover:bg-destructive/10 hover:text-destructive" 
                onClick={() => setIsDeleting(row.id)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Are you sure you want to delete "{row.name}"? This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleting(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(row.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
      className: "w-[100px]",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Sites</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSite(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
            </DialogHeader>
            <SiteForm 
              insuranceGroups={insuranceGroups}
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable 
        data={sites}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search sites..."
        searchFields={["name", "address"]}
      />
    </div>
  );
};

export default SiteTable;
