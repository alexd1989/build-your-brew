import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Palette, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  Star,
  Clock,
  Globe,
  Layout,
  Edit
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Multiple Resume Templates",
      description: "Choose from a variety of professional templates designed to make your resume stand out.",
      highlight: "15+ Templates"
    },
    {
      icon: <Edit className="h-8 w-8 text-primary" />,
      title: "Easy Drag & Drop Builder",
      description: "Intuitive interface that lets you build your resume quickly without any design skills.",
      highlight: "No Design Skills Required"
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "PDF Export",
      description: "Download your resume as a high-quality PDF ready for job applications.",
      highlight: "High Quality PDF"
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Customizable Design",
      description: "Personalize colors, fonts, and layouts to match your style and industry.",
      highlight: "Full Customization"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. Only you have access to your resume information.",
      highlight: "Bank-Level Security"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Auto-Save",
      description: "Never lose your work. Your resume is automatically saved as you type.",
      highlight: "Real-time Saving"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Multiple Resumes",
      description: "Create and manage multiple resume versions for different job applications.",
      highlight: "Unlimited Resumes"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Mobile Responsive",
      description: "Build and edit your resume on any device - desktop, tablet, or mobile.",
      highlight: "Any Device"
    },
    {
      icon: <Layout className="h-8 w-8 text-primary" />,
      title: "ATS-Friendly",
      description: "All templates are optimized for Applicant Tracking Systems used by employers.",
      highlight: "ATS Optimized"
    }
  ];

  const benefits = [
    "Create professional resumes in minutes",
    "Land more job interviews",
    "Stand out from other candidates",
    "Save time with pre-built sections",
    "Export to multiple formats",
    "Keep your data secure and private"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              Resume Builder
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </Link>
              <Button asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            Powerful Features for Professional Resumes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to create, customize, and perfect your resume. 
            Built with modern tools and designed for success.
          </p>
          <Button asChild size="lg" className="mb-4">
            <Link to="/dashboard">Start Building Your Resume</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Features Grid */}
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
            {features.map((feature, index) => (
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

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Our Resume Builder?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of professionals who have successfully landed their dream jobs using our platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
                <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first professional resume in under 10 minutes.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to="/dashboard">Build My Resume</Link>
                </Button>
              </div>
            </div>
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
            <Button asChild size="lg">
              <Link to="/dashboard">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">View Templates</Link>
            </Button>
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
};

export default Features;