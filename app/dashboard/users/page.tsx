// app/dashboard/users/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, MessageSquare, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { crmApi, type CRMUser, type CreateUserData, type UpdateUserData } from "@/lib/api/crm"

// Convert CRMUser to local User interface for compatibility
interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "manager"
  status: "active" | "inactive"
  avatar?: string
  lastActive: Date
  conversationCount: number
  notes?: string
  company?: string
  phone?: string
  job_title?: string
}

function convertCRMUserToUser(crmUser: CRMUser): User {
  return {
    id: crmUser.id,
    name: crmUser.name || "Unknown",
    email: crmUser.email || "",
    role: "user", // Default role, you can enhance this based on your needs
    status: "active", // Default status, you can enhance this based on your needs
    lastActive: crmUser.last_interaction ? new Date(crmUser.last_interaction) : new Date(),
    conversationCount: crmUser.total_conversations,
    notes: crmUser.notes,
    company: crmUser.company,
    phone: crmUser.phone,
    job_title: crmUser.job_title,
  }
}

function convertUserToCRMUser(user: User): UpdateUserData {
  return {
    name: user.name,
    email: user.email,
    company: user.company,
    phone: user.phone,
    job_title: user.job_title,
    notes: user.notes,
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load users from API
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const crmUsers = await crmApi.getUsers()
      const convertedUsers = crmUsers.map(convertCRMUserToUser)
      setUsers(convertedUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Search users
  useEffect(() => {
    if (searchTerm) {
      searchUsers()
    } else {
      loadUsers()
    }
  }, [searchTerm])

  const searchUsers = async () => {
    try {
      setLoading(true)
      const crmUsers = await crmApi.getUsers({ search: searchTerm })
      const convertedUsers = crmUsers.map(convertCRMUserToUser)
      setUsers(convertedUsers)
    } catch (error) {
      console.error("Failed to search users:", error)
      toast({
        title: "Error",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "user":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeVariant = (status: User["status"]) => {
    return status === "active" ? "default" : "secondary"
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const crmUserData = convertUserToCRMUser(updatedUser)
      await crmApi.updateUser(updatedUser.id, crmUserData)
      
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      
      toast({
        title: "Success",
        description: "User updated successfully.",
      })
      
      // Reload users
      await loadUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateUserSubmit = async (userData: CreateUserData) => {
    try {
      await crmApi.createUser(userData)
      
      setIsCreateDialogOpen(false)
      
      toast({
        title: "Success",
        description: "User created successfully.",
      })
      
      // Reload users
      await loadUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await crmApi.deleteUser(userId)
      
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
      
      // Reload users
      await loadUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>View and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.company && (
                    <p className="text-xs text-muted-foreground truncate">{user.company}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {user.conversationCount} conversations
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last active: {user.lastActive.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to user information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserEditForm user={selectedUser} onSave={handleSaveUser} onCancel={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <UserCreateForm onSave={handleCreateUserSubmit} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Keep your existing UserEditForm component and add UserCreateForm
function UserEditForm({
  user,
  onSave,
  onCancel,
}: {
  user: User
  onSave: (user: User) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(user)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Add notes about this user..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}

function UserCreateForm({
  onSave,
  onCancel,
}: {
  onSave: (userData: CreateUserData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Add notes about this user..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  )
}