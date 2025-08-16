import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ResumeBuilder from '@/components/ResumeBuilder';
import TemplateSelector from '@/components/TemplateSelector';
import { User, LogIn, FileText, Download, Palette, Shield, Users, Zap, CheckCircle, Star, Clock, Globe, Layout, Edit } from 'lucide-react';

const Index = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(!!id);
  const [selectedTemplate, setSelectedTemplate] = useState('carver');
  const [showTemplateSelector, setShowTemplateSelector] = useState(!id);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === '') {
      setShowTemplateSelector(true);
    } else {
      setSelectedTemplate(templateId);
    }
  };

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

  // If no specific resume ID and showing template selector, show template selection
  if (!id && showTemplateSelector) {
    return (
      <TemplateSelector
        user={user}
        loading={loading}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        onContinue={() => {
          if (user) {
            window.location.href = '/dashboard';
          } else {
            window.location.href = '/auth';
          }
        }}
      />
    );
  }

  // If no specific resume ID, show landing page
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Trusted by 10,000+ job seekers
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Build Professional Resumes in Minutes
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create stunning, ATS-friendly resumes with our intuitive builder. 
              Stand out from the competition and land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/dashboard">Create Resume</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/dashboard">My Resumes</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/auth">Create Resume</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/auth">Sign Up Free</Link>
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever plan available
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-background/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive suite of features helps you create professional resumes that get noticed by employers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <FileText className="h-8 w-8 text-primary" />,
                  title: "Multiple Templates",
                  description: "Choose from professional templates designed to make your resume stand out.",
                  highlight: "15+ Templates"
                },
                {
                  icon: <Edit className="h-8 w-8 text-primary" />,
                  title: "Easy Builder",
                  description: "Intuitive interface that lets you build your resume quickly without design skills.",
                  highlight: "Drag & Drop"
                },
                {
                  icon: <Download className="h-8 w-8 text-primary" />,
                  title: "PDF Export",
                  description: "Download your resume as a high-quality PDF ready for job applications.",
                  highlight: "High Quality"
                },
                {
                  icon: <Palette className="h-8 w-8 text-primary" />,
                  title: "Customizable",
                  description: "Personalize colors, fonts, and layouts to match your style and industry.",
                  highlight: "Full Control"
                },
                {
                  icon: <Shield className="h-8 w-8 text-primary" />,
                  title: "Secure & Private",
                  description: "Your data is encrypted and secure. Only you have access to your information.",
                  highlight: "Bank-Level Security"
                },
                {
                  icon: <Layout className="h-8 w-8 text-primary" />,
                  title: "ATS-Friendly",
                  description: "All templates are optimized for Applicant Tracking Systems used by employers.",
                  highlight: "ATS Optimized"
                }
              ].map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      {feature.icon}
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Building Your Professional Resume Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of successful job seekers who trust our platform to create winning resumes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/dashboard">Start Building Resume</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/auth">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/features">View Features</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background py-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">
              © 2024 Resume Builder. Built with ❤️ for job seekers everywhere.
            </p>
          </div>
        </footer>
      </div>
    );
  }

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
      {/* Content */}
      <ResumeBuilder 
        initialData={resumeData?.content} 
        onSave={id ? saveResume : undefined}
        readonly={id && !user}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
    </div>
  );
};

export default Index;
