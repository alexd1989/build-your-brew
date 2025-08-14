import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TestAuth = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setMessage(`Auth event: ${event}`);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    });

    if (error) {
      setMessage(`Sign up error: ${error.message}`);
    } else {
      setMessage('Sign up successful! Check your email for confirmation.');
    }
    
    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Sign in error: ${error.message}`);
    } else {
      setMessage('Sign in successful!');
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setMessage(`Sign out error: ${error.message}`);
    } else {
      setMessage('Signed out successfully!');
    }
    
    setLoading(false);
  };

  const testDatabase = async () => {
    if (!user) {
      setMessage('Please sign in first to test database');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Test creating a resume
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          title: 'Test Resume',
          content: { test: 'data' }
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // Test fetching resumes
      const { data: resumes, error: fetchError } = await supabase
        .from('resumes')
        .select('*');

      if (fetchError) throw fetchError;

      setMessage(`Database test successful! Created resume with ID: ${resume.id}. Total resumes: ${resumes.length}`);
    } catch (error) {
      setMessage(`Database test error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Database & Auth Test</CardTitle>
          <CardDescription>
            Test the Supabase setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <p className="text-green-600">✅ Signed in as: {user.email}</p>
              <Button onClick={testDatabase} disabled={loading} className="w-full">
                Test Database
              </Button>
              <Button onClick={signOut} disabled={loading} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={signUp} disabled={loading} className="flex-1">
                  Sign Up
                </Button>
                <Button onClick={signIn} disabled={loading} variant="outline" className="flex-1">
                  Sign In
                </Button>
              </div>
            </div>
          )}
          
          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('error') || message.includes('Error') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;