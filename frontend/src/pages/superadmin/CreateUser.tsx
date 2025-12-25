import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RichTextEditor } from "../../components/common/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import * as userService from "../../services/userService";
import { ArrowLeft } from "lucide-react";
import { toast } from "../../utils/toast";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhone,
  VALIDATION_MESSAGES,
  VALIDATION_REGEX,
  type ValidationResult,
} from "../../constants/validationConstants";

export default function CreateUser() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "" as "" | "freelancer" | "admin" | "agent" | "superadmin" | "client",
    // Freelancer specific fields
    hourlyRate: "",
    experience: "",
    bio: "",
  });

  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: "superadmin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "agent", label: "Agent" },
        { value: "client", label: "Client" },
        { value: "freelancer", label: "Freelancer" },
      ];
    } else if (isAdmin) {
      return [
        { value: "agent", label: "Agent" },
        { value: "freelancer", label: "Freelancer" },
        { value: "client", label: "Client" },
      ];
    }
    return [];
  };

  // Validate company name (optional field)
  const validateCompany = (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: true }; // Company is optional
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: VALIDATION_MESSAGES.COMPANY_NAME.MIN_LENGTH };
    }
    if (trimmed.length > 100) {
      return { isValid: false, error: VALIDATION_MESSAGES.COMPANY_NAME.MAX_LENGTH };
    }
    if (!VALIDATION_REGEX.COMPANY_NAME.test(trimmed)) {
      return { isValid: false, error: VALIDATION_MESSAGES.COMPANY_NAME.INVALID };
    }
    return { isValid: true };
  };

  const handleCreateUser = async () => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    const firstNameResult = validateFirstName(newUser.firstName);
    if (!firstNameResult.isValid) {
      newErrors.firstName = firstNameResult.error || VALIDATION_MESSAGES.FIRST_NAME.REQUIRED;
    }

    // Validate last name
    const lastNameResult = validateLastName(newUser.lastName);
    if (!lastNameResult.isValid) {
      newErrors.lastName = lastNameResult.error || VALIDATION_MESSAGES.LAST_NAME.REQUIRED;
    }

    // Validate email
    const emailResult = validateEmail(newUser.email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error || VALIDATION_MESSAGES.EMAIL.REQUIRED;
    }

    // Validate phone (required)
    const phoneResult = validatePhone(newUser.phone, false);
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error || VALIDATION_MESSAGES.PHONE.REQUIRED;
    }

    // Validate role (required)
    if (!newUser.role) {
      newErrors.role = "Please select a role";
    }

    // Validate company (optional)
    if (newUser.company && newUser.company.trim()) {
      const companyResult = validateCompany(newUser.company);
      if (!companyResult.isValid) {
        newErrors.company = companyResult.error || '';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    // Validate role restrictions
    if (
      isAdmin &&
      (newUser.role === "admin" || newUser.role === "superadmin")
    ) {
      toast.error(
        "You do not have permission to create admin or superadmin users"
      );
      return;
    }

    // Combine first and last name
    const fullName = `${newUser.firstName} ${newUser.lastName}`.trim();

    setLoading(true);
    setError(null);
    try {
      await userService.createUser({
        name: fullName,
        email: newUser.email,
        role: newUser.role as any,
        phone: newUser.phone || undefined,
        company: newUser.company || undefined,
      });

      const roleLabel =
        getAvailableRoles().find((r) => r.value === newUser.role)?.label ||
        newUser.role;
      toast.success(`${roleLabel} created successfully`);

      // Navigate back to user management
      navigate("/admin/users");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to create user";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setErrors({});
    }
  };

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/users")}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl mb-2">Create New User</h1>
              <p className="text-gray-600">
                {isSuperAdmin
                  ? "Create a new superadmin, admin, agent, or freelancer account"
                  : "Create a new agent or freelancer account"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <div className="space-y-6 max-w-6xl ">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={newUser.firstName}
                  onChange={(e) => {
                    setNewUser({ ...newUser, firstName: e.target.value });
                    if (errors.firstName) {
                      setFieldError("firstName", "");
                    }
                  }}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={newUser.lastName}
                  onChange={(e) => {
                    setNewUser({ ...newUser, lastName: e.target.value });
                    if (errors.lastName) {
                      setFieldError("lastName", "");
                    }
                  }}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({ ...newUser, email: e.target.value });
                    if (errors.email) {
                      setFieldError("email", "");
                    }
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) => {
                    setNewUser({ ...newUser, phone: e.target.value });
                    if (errors.phone) {
                      setFieldError("phone", "");
                    }
                  }}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={newUser.role || undefined}
                  onValueChange={(
                    val: "freelancer" | "admin" | "agent" | "superadmin" | "client"
                  ) => {
                    setNewUser({ ...newUser, role: val });
                    if (errors.role) {
                      setFieldError("role", "");
                    }
                  }}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                )}
              </div>
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={newUser.company}
                  onChange={(e) => {
                    setNewUser({ ...newUser, company: e.target.value });
                    if (errors.company) {
                      setFieldError("company", "");
                    }
                  }}
                  className={errors.company ? "border-red-500" : ""}
                />
                {errors.company && (
                  <p className="text-sm text-red-600 mt-1">{errors.company}</p>
                )}
              </div>
            </div>

            {newUser.role === "freelancer" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="e.g., 1500"
                    value={newUser.hourlyRate}
                    onChange={(e) =>
                      setNewUser({ ...newUser, hourlyRate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 5 years, Full Stack Developer"
                    value={newUser.experience}
                    onChange={(e) =>
                      setNewUser({ ...newUser, experience: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="bio">About</Label>
              <RichTextEditor
                value={newUser.bio}
                onChange={(value) =>
                  setNewUser({ ...newUser, bio: value })
                }
                placeholder={
                  newUser.role === "freelancer"
                    ? "Tell us about yourself, your skills, and experience..."
                    : "Tell us about yourself..."
                }
                className="mt-1"
                minHeight="150px"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

