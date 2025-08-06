import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, FileText, Shield, ShieldOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  email?: string;
  role?: string;
  resume_count?: number;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Get profiles with user roles and resume counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get resume counts
      const { data: resumeCounts, error: resumeError } = await supabase
        .from('resumes')
        .select('user_id');

      if (resumeError) throw resumeError;

      // Count resumes per user
      const resumeCountMap = resumeCounts?.reduce((acc, resume) => {
        acc[resume.user_id] = (acc[resume.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine data
      const usersWithDetails = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.user_id)?.role || 'user';
        const resumeCount = resumeCountMap[profile.user_id] || 0;
        
        return {
          ...profile,
          role: userRole,
          resume_count: resumeCount
        };
      }) || [];

      setUsers(usersWithDetails);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
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
                  <TableHead className="text-white">User ID</TableHead>
                  <TableHead className="text-white">Role</TableHead>
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
                    <TableCell className="text-white">
                      {userProfile.resume_count || 0}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userProfile.role}
                        onValueChange={(value) => updateUserRole(userProfile.user_id, value)}
                      >
                        <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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