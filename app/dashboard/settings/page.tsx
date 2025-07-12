"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { User, Bell, Shield, Database, Palette, Download, Upload, Trash2, RefreshCw, BarChart3 } from "lucide-react"

interface DatasetStats {
  totalRecords: number
  totalValue: string
  avgRentPerSF: string
  topAssociate: string
  lastUpdated: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profile: {
      name: "John Smith",
      email: "john.smith@okada.co",
      company: "OkADA & CO",
      role: "Administrator",
      bio: "Senior business consultant specializing in AI integration and digital transformation.",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      systemAlerts: true,
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      thirdPartySharing: false,
    },
    appearance: {
      theme: "system",
      sidebarCollapsed: false,
      compactMode: false,
    },
  })

  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null)
  const [isLoadingDataset, setIsLoadingDataset] = useState(false)
  const { toast } = useToast()

  const loadDatasetStats = async () => {
    setIsLoadingDataset(true)
    try {
      const response = await fetch("/api/dataset/stats")
      if (response.ok) {
        const stats = await response.json()
        setDatasetStats(stats)
      }
    } catch (error) {
      console.error("Failed to load dataset stats:", error)
    } finally {
      setIsLoadingDataset(false)
    }
  }

  useEffect(() => {
    loadDatasetStats()
  }, [])

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    })
  }

  const handleDatasetRefresh = async () => {
    setIsLoadingDataset(true)
    try {
      const response = await fetch("/api/dataset/refresh", { method: "POST" })
      if (response.ok) {
        await loadDatasetStats()
        toast({
          title: "Dataset refreshed",
          description: "Property dataset has been refreshed successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh dataset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDataset(false)
    }
  }

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="dataset">Dataset</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={settings.profile.company}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, company: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={settings.profile.role}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, role: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, bio: e.target.value },
                    }))
                  }
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button onClick={() => handleSaveSettings("Profile")}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified about important updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Get weekly summary reports</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, weeklyReports: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important system notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, systemAlerts: checked },
                    }))
                  }
                />
              </div>

              <Button onClick={() => handleSaveSettings("Notification")}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your data privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow collection of usage data for improvements</p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataCollection: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Enable analytics to improve your experience</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Third-party Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share data with trusted third-party services</p>
                </div>
                <Switch
                  checked={settings.privacy.thirdPartySharing}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, thirdPartySharing: checked },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Management</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("Privacy")}>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, theme: value },
                    }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar Collapsed by Default</Label>
                  <p className="text-sm text-muted-foreground">Start with a collapsed sidebar</p>
                </div>
                <Switch
                  checked={settings.appearance.sidebarCollapsed}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, sidebarCollapsed: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use compact spacing for more content</p>
                </div>
                <Switch
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, compactMode: checked },
                    }))
                  }
                />
              </div>

              <Button onClick={() => handleSaveSettings("Appearance")}>Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dataset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Property Dataset Management
              </CardTitle>
              <CardDescription>Manage and analyze your property dataset for AI insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {datasetStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{datasetStats.totalRecords}</div>
                    <div className="text-sm text-muted-foreground">Total Properties</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{datasetStats.totalValue}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{datasetStats.avgRentPerSF}</div>
                    <div className="text-sm text-muted-foreground">Avg Rent/SF</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{datasetStats.topAssociate}</div>
                    <div className="text-sm text-muted-foreground">Top Associate</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Dataset Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {datasetStats?.lastUpdated || "Never"}
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDatasetRefresh} disabled={isLoadingDataset}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDataset ? "animate-spin" : ""}`} />
                    Refresh Dataset
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Dataset Schema</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded">Property Address</div>
                  <div className="p-2 bg-muted rounded">Floor & Suite</div>
                  <div className="p-2 bg-muted rounded">Size (SF)</div>
                  <div className="p-2 bg-muted rounded">Rent/SF/Year</div>
                  <div className="p-2 bg-muted rounded">Associates (1-4)</div>
                  <div className="p-2 bg-muted rounded">Annual/Monthly Rent</div>
                  <div className="p-2 bg-muted rounded">GCI On 3 Years</div>
                  <div className="p-2 bg-muted rounded">Broker Email</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
