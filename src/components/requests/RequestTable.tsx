
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/data";
import { CheckCircle, XCircle, FileText, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type InsuranceRequest = {
  id: string;
  siteName: string;
  address: string;
  insuranceType: "Normal" | "Special";
  specialDetails?: string;
  requestDate: Date;
  status: "Pending" | "Approved" | "Denied";
  originalId?: string;
};

const RequestTable = () => {
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<InsuranceRequest | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [showApproval, setShowApproval] = useState(false);
  const [showDenial, setShowDenial] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_requests')
        .select('*');
      
      if (error) throw error;
      
      // Convert Supabase data to the format expected by the application
      const formattedRequests = data.map(request => ({
        id: request.id,
        siteName: request.site_name,
        address: request.address,
        insuranceType: request.insurance_type as "Normal" | "Special",
        specialDetails: request.special_details || undefined,
        requestDate: new Date(request.request_date || new Date()),
        status: request.status as "Pending" | "Approved" | "Denied",
      }));
      
      setRequests(formattedRequests);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load insurance requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (request: InsuranceRequest) => {
    try {
      const { error } = await supabase
        .from('insurance_requests')
        .update({ status: 'Approved' })
        .eq('id', request.id);
      
      if (error) throw error;
      
      setRequests(
        requests.map((r) => r.id === request.id ? { ...r, status: "Approved" } : r)
      );
      setShowApproval(false);
      toast.success(`Request #${request.id} has been approved`);
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };
  
  const handleDeny = async (request: InsuranceRequest) => {
    try {
      const { error } = await supabase
        .from('insurance_requests')
        .update({ 
          status: 'Denied',
          special_details: denialReason || request.specialDetails || null
        })
        .eq('id', request.id);
      
      if (error) throw error;
      
      setRequests(
        requests.map((r) => r.id === request.id ? { ...r, status: "Denied" } : r)
      );
      setShowDenial(false);
      setDenialReason("");
      toast.success(`Request #${request.id} has been denied`);
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    }
  };
  
  const getStatusBadge = (status: InsuranceRequest["status"]) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Denied":
        return <Badge variant="destructive">Denied</Badge>;
      case "Pending":
        return <Badge variant="outline" className="animate-pulse border-amber-500 text-amber-500">Pending</Badge>;
      default:
        return null;
    }
  };
  
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof InsuranceRequest,
      enableSorting: true,
      className: "w-[80px]",
    },
    {
      header: "Site Name",
      accessorKey: "siteName" as keyof InsuranceRequest,
      enableSorting: true,
    },
    {
      header: "Address",
      accessorKey: "address" as keyof InsuranceRequest,
      enableSorting: true,
    },
    {
      header: "Type",
      accessorKey: "insuranceType" as keyof InsuranceRequest,
      enableSorting: true,
      className: "w-[120px]",
    },
    {
      header: "Special Details",
      accessorKey: (row: InsuranceRequest) => (
        <div className="flex items-center">
          {row.specialDetails ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-muted-foreground"
              onClick={() => setViewingDetails(row.id)}
            >
              <FileText className="h-4 w-4" />
              <span>View Details</span>
            </Button>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          
          <Dialog open={viewingDetails === row.id} onOpenChange={(open) => !open && setViewingDetails(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Special Details</DialogTitle>
              </DialogHeader>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="whitespace-pre-wrap">{row.specialDetails}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: (row: InsuranceRequest) => formatDate(row.requestDate),
      enableSorting: true,
      className: "w-[120px]",
    },
    {
      header: "Status",
      accessorKey: (row: InsuranceRequest) => getStatusBadge(row.status),
      enableSorting: true,
      className: "w-[120px]",
    },
    {
      header: "Actions",
      accessorKey: (row: InsuranceRequest) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === "Pending" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                onClick={() => {
                  setSelectedRequest(row);
                  setShowApproval(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedRequest(row);
                  setShowDenial(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deny
              </Button>
            </>
          )}
        </div>
      ),
      className: "w-[200px]",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Insurance Requests</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Requests</DialogTitle>
                <DialogDescription>
                  This feature would download all requests as a CSV file in a real implementation.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end pt-4">
                <Button>Download CSV</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading requests...</span>
        </div>
      ) : (
        <DataTable 
          data={requests}
          columns={columns}
          keyField="id"
          searchPlaceholder="Search requests..."
          searchFields={["id", "siteName", "address", "insuranceType"]}
        />
      )}
      
      {/* Approval Dialog */}
      <Dialog open={showApproval} onOpenChange={setShowApproval}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted/50">
              <p>You are about to approve the insurance request for:</p>
              <p className="font-medium mt-2">{selectedRequest?.siteName}</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.address}</p>
            </div>
            
            <div className="p-4 rounded-md border border-green-500/20 bg-green-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-500">Approve this request?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once approved, you should create a new Insurance Group and link it to a Site.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproval(false)}>
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() => selectedRequest && handleApprove(selectedRequest)}
              >
                Approve Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Denial Dialog */}
      <Dialog open={showDenial} onOpenChange={setShowDenial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted/50">
              <p>You are about to deny the insurance request for:</p>
              <p className="font-medium mt-2">{selectedRequest?.siteName}</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.address}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="denialReason">Reason for Denial (Optional)</Label>
              <Textarea
                id="denialReason"
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Enter reason for denial..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDenial(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleDeny(selectedRequest)}
              >
                Deny Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestTable;
