
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Pencil, Trash } from "lucide-react";
import { Site, InsuranceGroup, formatDate, isExpiringSoon, mockSites, mockInsuranceGroups, getSiteInsuranceGroup } from "@/lib/data";
import SiteForm from "./SiteForm";

const SiteTable = () => {
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const handleSave = (site: Site) => {
    if (editingSite) {
      // Update existing site
      setSites(sites.map(s => s.id === site.id ? site : s));
    } else {
      // Add new site with a generated ID
      const newId = Math.max(0, ...sites.map(s => s.id)) + 1;
      setSites([...sites, { ...site, id: newId }]);
    }
    setEditingSite(null);
  };
  
  const handleDelete = (id: number) => {
    setSites(sites.filter(site => site.id !== id));
    setIsDeleting(null);
  };
  
  const columns = [
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
                insuranceGroups={mockInsuranceGroups}
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
              insuranceGroups={mockInsuranceGroups}
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
