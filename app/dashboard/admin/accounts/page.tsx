"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string | null;
  createdAt: Date;
}

export default function AdminAccountsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT" as UserRole,
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  useEffect(() => {
    // Check if we should open the dialog (e.g., from quick create button)
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "create") {
      handleCreateUser();
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/admin/accounts");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        let filteredUsers = data.users || [];
        if (filterRole !== "all") {
          filteredUsers = filteredUsers.filter((user: User) => user.role === filterRole);
        }
        setUsers(filteredUsers);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PATIENT",
      phone: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      phone: user.phone || "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    setIsSaving(true);

    try {
      // If creating new user, validate password
      if (!selectedUser) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsSaving(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          setIsSaving(false);
          return;
        }
      }

      const url = selectedUser
        ? `/api/admin/users/${selectedUser.id}`
        : "/api/admin/users";
      const method = selectedUser ? "PATCH" : "POST";

      const requestBody: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.phone && { phone: formData.phone }),
      };

      // Only include password when creating new user
      if (!selectedUser && formData.password) {
        requestBody.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save user");
      }

      toast.success(selectedUser ? "User updated" : "User created");
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/user/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Account Management</h1>
                <p className="text-muted-foreground">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <Button onClick={handleCreateUser}>
                <IconPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      {users.length} user{users.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="PATIENT">Patients</SelectItem>
                      <SelectItem value="DOCTOR">Doctors</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                handleUpdateRole(user.id, value as UserRole)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PATIENT">Patient</SelectItem>
                                <SelectItem value="DOCTOR">Doctor</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.emailVerified ? "default" : "secondary"}
                            >
                              {user.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              {user.role !== "ADMIN" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Create/Edit User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                  <DialogTitle className="text-lg">
                    {selectedUser ? "Edit User" : "Create user account"}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {selectedUser
                      ? "Update user information"
                      : "Enter user information to create a new account"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }}>
                  <FieldGroup className="space-y-1 py-4">
                    <Field>
                      <FieldLabel htmlFor="name" className="text-sm">
                        Full Name
                      </FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        disabled={isSaving}
                        value={formData.name}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email" className="text-sm">
                        Email
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        disabled={isSaving}
                        value={formData.email}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="role" className="text-sm">
                        Role
                      </FieldLabel>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value as UserRole })
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger id="role" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PATIENT">Patient</SelectItem>
                          <SelectItem value="DOCTOR">Doctor</SelectItem>
                          <SelectItem value="ADMIN">Admin / Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="phone" className="text-sm">
                        Phone (Optional)
                      </FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="09XX XXX XXXX or 02X XXX XXXX"
                        maxLength={13}
                        disabled={isSaving}
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-9"
                      />
                    </Field>
                    {!selectedUser && (
                      <Field>
                        <Field className="grid grid-cols-2 gap-3">
                          <Field>
                            <FieldLabel htmlFor="password" className="text-sm">
                              Password
                            </FieldLabel>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                disabled={isSaving}
                                value={formData.password}
                                onChange={handleChange}
                                className="pr-10 h-9"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={isSaving}
                              >
                                {showPassword ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="confirmPassword" className="text-sm">
                              Confirm
                            </FieldLabel>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                disabled={isSaving}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="pr-10 h-9"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={isSaving}
                              >
                                {showConfirmPassword ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </Field>
                        </Field>
                        <FieldDescription className="text-xs text-shadow-2xs">
                          Minimum 8 characters
                        </FieldDescription>
                      </Field>
                    )}
                  </FieldGroup>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : selectedUser ? "Update" : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user account
                    {userToDelete && (
                      <>
                        {" "}
                        <strong>{userToDelete.name}</strong> ({userToDelete.email})
                      </>
                    )}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      "Delete User"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

