
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Pencil, Trash, Calendar, Building2 } from "lucide-react";
import { 
  InsuranceGroup, 
  formatDate, 
  isExpiringSoon, 
  getDaysUntil,
  mockInsuranceGroups,
  getInsuranceGroupSites
} from "@/lib/data";
import InsuranceGroupForm from "./InsuranceGroupForm";

const InsuranceGroupTable = () => {
  const [insuranceGroups, setInsuranceGroups] = useState<InsuranceGroup[]>(mockInsuranceGroups);
  const [editingGroup, setEditingGroup] = useState<InsuranceGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showLinkedSites, setShowLinkedSites] = useState<number | null>(null);
  
  const handleSave = (group: InsuranceGroup) => {
    if (editingGroup) {
      // Update existing group
      setInsuranceGroups(insuranceGroups.map(g => g.id === group.id ? group : g));
    } else {
      // Add new group with a generated ID
      const newId = Math.max(0, ...insuranceGroups.map(g => g.id)) + 1;
      setInsuranceGroups([...insuranceGroups, { ...group, id: newId }]);
    }
    setEditingGroup(null);
  };
  
  const handleDelete = (id: number) => {
    // Check if group is linked to sites
    const linkedSites = getInsuranceGroupSites(id);
    if (linkedSites.length > 0) {
      alert(`Cannot delete this insurance group because it is linked to ${linkedSites.length} sites.`);
      setIsDeleting(null);
      return;
    }
    
    setInsuranceGroups(insuranceGroups.filter(group => group.id !== id));
    setIsDeleting(null);
  };
  
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      enableSorting: true,
      className: "w-[80px]",
    },
    {
      header: "Insurance Provider",
      accessorKey: "provider",
      enableSorting: true,
    },
    {
      header: "End Date",
      accessorKey: (row: InsuranceGroup) => {
        const dateStr = formatDate(row.endDate);
        const daysLeft = getDaysUntil(row.endDate);
        const expiring = isExpiringSoon(row.endDate);
        
        return (
          <div className="flex items-center gap-2">
            {expiring ? (
              <Badge variant="destructive" className="animate-pulse">
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
              </Badge>
            ) : (
              <Badge variant="outline">{daysLeft} days left</Badge>
            )}
            <span>{dateStr}</span>
          </div>
        );
      },
    },
    {
      header: "Linked Sites",
      accessorKey: (row: InsuranceGroup) => {
        const sites = getInsuranceGroupSites(row.id);
        return (
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-muted-foreground"
              onClick={() => setShowLinkedSites(row.id)}
            >
              <Building2 className="h-4 w-4" />
              <span>{sites.length} sites</span>
            </Button>
            
            <Dialog open={showLinkedSites === row.id} onOpenChange={(open) => !open && setShowLinkedSites(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sites linked to {row.provider}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {sites.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No sites linked to this insurance group.</p>
                  ) : (
                    sites.map((site) => (
                      <div key={site.id} className="p-3 rounded-md bg-muted/50">
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-muted-foreground">{site.address}</div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
      className: "w-[120px]",
    },
    {
      header: "Actions",
      accessorKey: (row: InsuranceGroup) => (
        <div className="flex items-center gap-2 justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setEditingGroup(row)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Insurance Group</DialogTitle>
              </DialogHeader>
              <InsuranceGroupForm 
                group={row} 
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
                <DialogTitle>Delete Insurance Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Are you sure you want to delete this insurance group? This action cannot be undone.
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
        <h2 className="text-2xl font-semibold tracking-tight">Insurance Groups</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGroup(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Insurance Group</DialogTitle>
            </DialogHeader>
            <InsuranceGroupForm 
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable 
        data={insuranceGroups}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search insurance groups..."
        searchFields={["id", "provider"]}
      />
    </div>
  );
};

export default InsuranceGroupTable;
