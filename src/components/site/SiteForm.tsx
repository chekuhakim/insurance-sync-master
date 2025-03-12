import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Site, InsuranceGroup, formatDate } from "@/lib/data";

interface SiteFormProps {
  site?: Site;
  insuranceGroups: InsuranceGroup[];
  onSave: (site: Site) => void;
  onClose?: () => void; // Optional prop to close the modal
}

const SiteForm = ({ site, insuranceGroups, onSave, onClose }: SiteFormProps) => {
  const [formData, setFormData] = useState<Omit<Site, "id"> & { id?: number }>({
    name: "",
    address: "",
    insuranceGroupId: 0,
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    insuranceGroupId: "",
  });

  useEffect(() => {
    if (site) {
      setFormData(site);
    }
  }, [site]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, insuranceGroupId: parseInt(value) }));
    if (errors.insuranceGroupId) {
      setErrors(prev => ({ ...prev, insuranceGroupId: "" }));
    }
  };

  const validate = () => {
    const newErrors = {
      name: formData.name ? "" : "Site name is required",
      address: formData.address ? "" : "Address is required",
      insuranceGroupId: formData.insuranceGroupId ? "" : "Please select an insurance group",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      id: site?.id || 0,
      name: formData.name,
      address: formData.address,
      insuranceGroupId: formData.insuranceGroupId,
    });

    // Reset form after successful submission
    setFormData({
      name: "",
      address: "",
      insuranceGroupId: 0,
    });
    setErrors({
      name: "",
      address: "",
      insuranceGroupId: "",
    });

    if (onClose) onClose(); // Close the modal if provided
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Site Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter site name"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="insuranceGroupId">Insurance Group</Label>
        <Select
          value={formData.insuranceGroupId ? String(formData.insuranceGroupId) : ""}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger id="insuranceGroupId" className={errors.insuranceGroupId ? "border-destructive" : ""}>
            <SelectValue placeholder="Select insurance group" />
          </SelectTrigger>
          <SelectContent>
            {insuranceGroups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>
                {group.provider} (Expires: {formatDate(group.endDate)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.insuranceGroupId && <p className="text-sm text-destructive">{errors.insuranceGroupId}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default SiteForm;
