import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Calendar, Trash2, Edit, LogOut, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Resume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchResumes();
  }, [user, navigate]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    if (!newResumeTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user?.id,
          title: newResumeTitle,
          content: {}
        })
        .select()
        .single();

      if (error) throw error;

      setResumes([data, ...resumes]);
      setNewResumeTitle('');
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Resume created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume",
        variant: "destructive",
      });
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResumes(resumes.filter(resume => resume.id !== id));
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/80">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Create Resume Button */}
        <div className="mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-primary hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Resume
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create New Resume</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Resume Title</Label>
                  <Input
                    id="title"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    placeholder="Enter resume title"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createResume}>
                    Create Resume
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {resume.title}
                </CardTitle>
                <CardDescription className="text-white/70 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Link to={`/builder/${resume.id}`}>
                    <Button 
                      size="sm" 
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteResume(resume.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {resumes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
            <p className="text-white/70 mb-6">Create your first resume to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;