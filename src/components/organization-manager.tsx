'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, Copy, Check, UserMinus, LogOut, Building2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface OrganizationData {
  organization: {
    _id: string
    name: string
    description: string
    createdAt: string
  } | null
  members?: Array<{
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
  userRole?: string
}

export function OrganizationManager() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orgData, setOrgData] = useState<OrganizationData | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDescription, setNewOrgDescription] = useState('')
  const [joinOrgId, setJoinOrgId] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getMyOrganization()
      setOrgData(data)
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      await apiClient.createOrganization(newOrgName, newOrgDescription)
      toast({
        title: "Success!",
        description: "Organization created successfully"
      })
      setNewOrgName('')
      setNewOrgDescription('')
      setShowCreateForm(false)
      fetchOrganization()
    } catch (error) {
      console.error('Error creating organization:', error)
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleJoinOrganization = async () => {
    if (!joinOrgId.trim()) {
      toast({
        title: "Error",
        description: "Organization ID is required",
        variant: "destructive"
      })
      return
    }

    try {
      setJoining(true)
      await apiClient.joinOrganization(joinOrgId)
      toast({
        title: "Success!",
        description: "Joined organization successfully"
      })
      setJoinOrgId('')
      setShowJoinForm(false)
      fetchOrganization()
    } catch (error) {
      console.error('Error joining organization:', error)
      toast({
        title: "Error",
        description: "Failed to join organization. Check the ID and try again.",
        variant: "destructive"
      })
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveOrganization = async () => {
    if (!confirm('Are you sure you want to leave this organization? You will lose access to shared content.')) {
      return
    }

    try {
      await apiClient.leaveOrganization()
      toast({
        title: "Success",
        description: "Left organization successfully"
      })
      fetchOrganization()
    } catch (error) {
      console.error('Error leaving organization:', error)
      toast({
        title: "Error",
        description: "Failed to leave organization",
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      return
    }

    try {
      await apiClient.removeMember(userId)
      toast({
        title: "Success",
        description: `${userName} removed from organization`
      })
      fetchOrganization()
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      })
    }
  }

  const copyOrgId = () => {
    if (orgData?.organization?._id) {
      navigator.clipboard.writeText(orgData.organization._id)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Organization ID copied to clipboard"
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  // No organization - show create/join options
  if (!orgData?.organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
          <CardDescription>
            Join or create an organization to share content with team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCreateForm && !showJoinForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setShowCreateForm(true)} className="w-full">
                Create Organization
              </Button>
              <Button onClick={() => setShowJoinForm(true)} variant="outline" className="w-full">
                Join Organization
              </Button>
            </div>
          )}

          {showCreateForm && (
            <div className="space-y-4 border p-4 rounded-lg">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g., Springfield High School"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="orgDesc">Description (Optional)</Label>
                <Input
                  id="orgDesc"
                  placeholder="Brief description"
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateOrganization} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showJoinForm && (
            <div className="space-y-4 border p-4 rounded-lg">
              <div>
                <Label htmlFor="joinId">Organization ID</Label>
                <Input
                  id="joinId"
                  placeholder="Paste organization ID here"
                  value={joinOrgId}
                  onChange={(e) => setJoinOrgId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ask your organization admin for the ID
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleJoinOrganization} disabled={joining}>
                  {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                </Button>
                <Button onClick={() => setShowJoinForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Has organization - show details and members
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {orgData.organization.name}
        </CardTitle>
        <CardDescription>
          {orgData.organization.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization ID */}
        <div>
          <Label className="text-sm font-semibold">Organization ID</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={orgData.organization._id}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyOrgId} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Share this ID with others to invite them to your organization
          </p>
        </div>

        {/* Members List */}
        <div>
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({orgData.members?.length || 0})
          </Label>
          <div className="mt-2 space-y-2">
            {orgData.members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {member.role === 'admin' ? '👑 Admin' : 'Member'} • Joined {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {orgData.userRole === 'admin' && member.role !== 'admin' && (
                  <Button
                    onClick={() => handleRemoveMember(member._id, member.name)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leave Organization */}
        <Button
          onClick={handleLeaveOrganization}
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Organization
        </Button>
      </CardContent>
    </Card>
  )
}

