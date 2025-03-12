
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { InsuranceGroup, formatDate } from "@/lib/data";

interface InsuranceGroupFormProps {
  group?: InsuranceGroup;
  onSave: (group: InsuranceGroup) => void;
}

const InsuranceGroupForm = ({ group, onSave }: InsuranceGroupFormProps) => {
  const [formData, setFormData] = useState<Omit<InsuranceGroup, "id"> & { id?: number }>({
    provider: "",
    endDate: new Date(),
  });
  
  const [errors, setErrors] = useState({
    provider: "",
    endDate: "",
  });
  
  useEffect(() => {
    if (group) {
      setFormData(group);
    }
  }, [group]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, endDate: date }));
      // Clear error when field is edited
      if (errors.endDate) {
        setErrors(prev => ({ ...prev, endDate: "" }));
      }
    }
  };
  
  const validate = () => {
    const newErrors = {
      provider: formData.provider ? "" : "Provider name is required",
      endDate: formData.endDate ? "" : "End date is required",
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onSave({
      id: group?.id || 0, // Will be replaced with generated ID if this is a new group
      provider: formData.provider,
      endDate: formData.endDate,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provider">Insurance Provider</Label>
        <Input
          id="provider"
          name="provider"
          value={formData.provider}
          onChange={handleChange}
          placeholder="Enter provider name"
          className={errors.provider ? "border-destructive" : ""}
        />
        {errors.provider && <p className="text-sm text-destructive">{errors.provider}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                errors.endDate ? "border-destructive" : ""
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.endDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default InsuranceGroupForm;
