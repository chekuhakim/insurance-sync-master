
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { InsuranceRequest, CURRENT_DATE, mockRequests } from "@/lib/data";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RequestFormProps {
  onSubmit?: (request: InsuranceRequest) => void;
}

const RequestForm = ({ onSubmit }: RequestFormProps) => {
  const [formData, setFormData] = useState<Omit<InsuranceRequest, "id" | "requestDate" | "status">>({
    siteName: "",
    address: "",
    insuranceType: "Normal",
  });
  
  const [errors, setErrors] = useState({
    siteName: "",
    address: "",
    insuranceType: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleRadioChange = (value: "Normal" | "Special") => {
    setFormData(prev => ({ ...prev, insuranceType: value }));
    // Clear error when field is edited
    if (errors.insuranceType) {
      setErrors(prev => ({ ...prev, insuranceType: "" }));
    }
  };
  
  const validate = () => {
    const newErrors = {
      siteName: formData.siteName ? "" : "Site name is required",
      address: formData.address ? "" : "Address is required",
      insuranceType: formData.insuranceType ? "" : "Insurance type is required",
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const newId = Math.max(0, ...mockRequests.map(r => r.id)) + 1;
      const newRequest: InsuranceRequest = {
        id: newId,
        siteName: formData.siteName,
        address: formData.address,
        insuranceType: formData.insuranceType,
        specialDetails: formData.specialDetails,
        requestDate: CURRENT_DATE,
        status: "Pending",
      };
      
      if (onSubmit) {
        onSubmit(newRequest);
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast.success(`Request submitted successfully! Request ID: ${newId}`);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          siteName: "",
          address: "",
          insuranceType: "Normal",
          specialDetails: "",
        });
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="overflow-hidden border border-border/50 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="Enter site name"
                className={errors.siteName ? "border-destructive" : ""}
                disabled={isSubmitting || isSuccess}
              />
              {errors.siteName && <p className="text-sm text-destructive">{errors.siteName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className={errors.address ? "border-destructive" : ""}
                disabled={isSubmitting || isSuccess}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Insurance Type</Label>
              <RadioGroup 
                value={formData.insuranceType} 
                onValueChange={(value) => handleRadioChange(value as "Normal" | "Special")}
                className="flex flex-col space-y-1"
                disabled={isSubmitting || isSuccess}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Normal" id="normal" />
                  <Label htmlFor="normal" className="cursor-pointer">Normal Insurance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Special" id="special" />
                  <Label htmlFor="special" className="cursor-pointer">Special Insurance</Label>
                </div>
              </RadioGroup>
              {errors.insuranceType && <p className="text-sm text-destructive">{errors.insuranceType}</p>}
            </div>
            
            {formData.insuranceType === "Special" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="specialDetails">Special Details</Label>
                <Textarea
                  id="specialDetails"
                  name="specialDetails"
                  value={formData.specialDetails || ""}
                  onChange={handleChange}
                  placeholder="Enter special insurance requirements..."
                  className="min-h-[100px]"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="min-w-[120px]"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submitted
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </div>
    </form>
  );
};

export default RequestForm;
