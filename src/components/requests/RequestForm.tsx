
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENT_DATE } from "@/lib/data";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface RequestFormProps {
  onSubmit?: (request: any) => void;
}

const RequestForm = ({ onSubmit }: RequestFormProps) => {
  const [formData, setFormData] = useState<{
    siteName: string;
    address: string;
    insuranceType: "Normal" | "Special";
    specialDetails?: string;
  }>({
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
  const { user } = useAuth();
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const newRequest = {
        site_name: formData.siteName,
        address: formData.address,
        insurance_type: formData.insuranceType,
        special_details: formData.specialDetails || null,
        request_date: new Date().toISOString(),
        status: "Pending",
        user_id: user?.id || null
      };
      
      const { data, error } = await supabase
        .from('insurance_requests')
        .insert(newRequest)
        .select();
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success(`Request submitted successfully!`);
      
      if (onSubmit && data) {
        onSubmit(data[0]);
      }
      
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
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
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
