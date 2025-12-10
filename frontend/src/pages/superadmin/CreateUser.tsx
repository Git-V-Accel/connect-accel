import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "../../utils/toast";

export default function CreateUser() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { createUser, getAllUsers } = useData();
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "freelancer" as "freelancer" | "admin" | "agent" | "superadmin",
    // Freelancer specific fields
    hourlyRate: "",
    experience: "",
    bio: "",
  });

  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";

  // Get available roles based on current user's permissions
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: "superadmin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "agent", label: "Agent" },
        { value: "freelancer", label: "Freelancer" },
      ];
    } else if (isAdmin) {
      return [
        { value: "agent", label: "Agent" },
        { value: "freelancer", label: "Freelancer" },
      ];
    }
    return [];
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate permissions
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

    createUser({
      name: fullName,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone || undefined,
      company: newUser.company || undefined,
      title: newUser.role === "freelancer" ? newUser.experience || undefined : undefined,
      hourlyRate: newUser.role === "freelancer" && newUser.hourlyRate ? Number(newUser.hourlyRate) : undefined,
      bio: newUser.bio || undefined,
    });

    const roleLabel =
      getAvailableRoles().find((r) => r.value === newUser.role)?.label ||
      newUser.role;
    toast.success(`${roleLabel} created successfully`);

    // Navigate back to user management
    navigate("/admin/users");
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                />
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(
                    val: "freelancer" | "admin" | "agent" | "superadmin"
                  ) => setNewUser({ ...newUser, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={newUser.company}
                  onChange={(e) =>
                    setNewUser({ ...newUser, company: e.target.value })
                  }
                />
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
              <Textarea
                id="bio"
                placeholder={
                  newUser.role === "freelancer"
                    ? "Tell us about yourself, your skills, and experience..."
                    : "Tell us about yourself..."
                }
                value={newUser.bio}
                onChange={(e) =>
                  setNewUser({ ...newUser, bio: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

