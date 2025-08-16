import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, FileText, Shield, ShieldOff, Eye, UserX, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  email?: string;
  role?: string;
  resume_count?: number;
  is_active?: boolean;
  resumes?: Array<{
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }>;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        return `Connection failed: ${error.message}`;
      }
      console.log('Supabase connection test successful');
      return 'Connection successful';
    } catch (err) {
      console.error('Supabase connection test error:', err);
      return `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      console.log('Starting to fetch users...');
      
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          created_at
        `);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Roles error:', rolesError);
        throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
      }

      console.log('Roles fetched:', roles?.length || 0);

      // Get resumes
      const { data: resumes, error: resumeError } = await supabase
        .from('resumes')
        .select('id, user_id, title, created_at, updated_at');

      if (resumeError) {
        console.error('Resumes error:', resumeError);
        throw new Error(`Failed to fetch resumes: ${resumeError.message}`);
      }

      console.log('Resumes fetched:', resumes?.length || 0);

      // Try to get auth users (this might fail if admin API is not available)
      let authUsers: any[] = [];
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.warn('Admin API not available:', authError.message);
          // Continue without auth user data
        } else {
          authUsers = authData.users || [];
          console.log('Auth users fetched:', authUsers.length);
        }
      } catch (adminError) {
        console.warn('Admin API not available:', adminError);
        // Continue without auth user data
      }

      // Group resumes by user
      const resumesByUser = resumes?.reduce((acc, resume) => {
        if (!acc[resume.user_id]) {
          acc[resume.user_id] = [];
        }
        acc[resume.user_id].push(resume);
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Combine data
      const usersWithDetails = profiles?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.user_id);
        const userRole = roles?.find(role => role.user_id === profile.user_id)?.role || 'user';
        const userResumes = resumesByUser[profile.user_id] || [];
        
        return {
          ...profile,
          email: authUser?.email || 'Email not available',
          role: userRole,
          resume_count: userResumes.length,
          is_active: authUser ? !authUser.banned_until : true, // Default to true if no auth user data
          resumes: userResumes
        };
      }) || [];

      console.log('Combined users data:', usersWithDetails.length);
      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole as 'user' | 'admin'
        });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Try to use admin API if available
      try {
        if (isActive) {
          // Unban user
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: 'none'
          });
          if (error) throw error;
        } else {
          // Ban user
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: '876000h' // 100 years
          });
          if (error) throw error;
        }
      } catch (adminError) {
        console.warn('Admin API not available for user status update:', adminError);
        toast({
          title: "Warning",
          description: "Admin API not available. User status change may not be applied.",
          variant: "default",
        });
      }

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, is_active: isActive }
          : user
      ));

      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const impersonateUser = async (userId: string) => {
    try {
      // This would require additional backend implementation
      // For now, we'll show a placeholder
      toast({
        title: "Feature Coming Soon",
        description: "User impersonation will be available in a future update",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-white/80">Manage users and their resumes</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.reduce((total, user) => total + (user.resume_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter(user => user.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Section */}
        <Card className="bg-blue-500/10 backdrop-blur-lg border-blue-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-400">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-sm mb-2">
              User: {user?.email || 'Not logged in'} | 
              Admin: {isAdmin ? 'Yes' : 'No'} | 
              Loading: {loading ? 'Yes' : 'No'}
            </p>
            {error && (
              <p className="text-red-300 mb-2">Error: {error}</p>
            )}
            <Button 
              onClick={async () => {
                const result = await testSupabaseConnection();
                console.log('Connection test result:', result);
              }}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Test Supabase Connection
            </Button>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
            <CardDescription className="text-white/70">
              Manage user roles and view resume statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Display Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">User ID</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Resumes</TableHead>
                  <TableHead className="text-white">Joined</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userProfile) => (
                  <TableRow key={userProfile.id} className="border-white/20">
                    <TableCell className="text-white">
                      {userProfile.display_name || 'No name'}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {userProfile.email || 'No email'}
                    </TableCell>
                    <TableCell className="text-white/70 font-mono text-xs">
                      {userProfile.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={userProfile.role === 'admin' ? 'default' : 'secondary'}
                        className={userProfile.role === 'admin' ? 'bg-white text-primary' : 'bg-white/20 text-white'}
                      >
                        {userProfile.role === 'admin' ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <ShieldOff className="w-3 h-3 mr-1" />
                        )}
                        {userProfile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={userProfile.is_active}
                          onCheckedChange={(checked) => toggleUserStatus(userProfile.user_id, checked)}
                        />
                        <span className="text-white/70 text-sm">
                          {userProfile.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                            <Eye className="w-4 h-4 mr-1" />
                            {userProfile.resume_count || 0}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Resumes by {userProfile.display_name || userProfile.email}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="max-h-96 overflow-y-auto">
                            {userProfile.resumes && userProfile.resumes.length > 0 ? (
                              <div className="space-y-2">
                                {userProfile.resumes.map((resume) => (
                                  <div key={resume.id} className="p-3 border rounded-lg">
                                    <h4 className="font-medium">{resume.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Created: {new Date(resume.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Updated: {new Date(resume.updated_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No resumes found</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={userProfile.role}
                          onValueChange={(value) => updateUserRole(userProfile.user_id, value)}
                        >
                          <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => impersonateUser(userProfile.user_id)}
                          className="text-white hover:bg-white/10"
                          title="Impersonate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;