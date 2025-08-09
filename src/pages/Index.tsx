import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ResumeBuilder from '@/components/ResumeBuilder';
import { User, LogIn } from 'lucide-react';

const Index = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(!!id);

  useEffect(() => {
    if (id && user) {
      loadResume();
    }
  }, [id, user]);

  const loadResume = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Resume not found",
            description: "The resume you're looking for doesn't exist or you don't have access to it.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setResumeData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load resume",
        variant: "destructive",
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const saveResume = async (content: any) => {
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .update({ content })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resume saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      });
    }
  };

  if (loading || resumeLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If trying to edit a specific resume but not logged in
  if (id && !user) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-white/80 mb-6">You need to sign in to edit this resume.</p>
          <Link to="/auth">
            <Button className="bg-white text-primary hover:bg-white/90">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-white text-primary hover:bg-white/90">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ResumeBuilder 
        initialData={resumeData?.content} 
        onSave={id ? saveResume : undefined}
        readonly={id && !user}
      />
    </div>
  );
};

export default Index;
