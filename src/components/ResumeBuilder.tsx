import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Download, Save } from 'lucide-react';
import { generatePDF } from '@/lib/pdf-generator';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface Skill {
  id: string;
  name: string;
  level: string;
}

interface ResumeBuilderProps {
  initialData?: any;
  onSave?: (content: any) => Promise<void>;
  readonly?: boolean;
}

const ResumeBuilder = ({ initialData, onSave, readonly = false }: ResumeBuilderProps) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: ''
  });

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([{
    id: '1',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  }]);

  const [education, setEducation] = useState<Education[]>([{
    id: '1',
    school: '',
    degree: '',
    startDate: '',
    endDate: ''
  }]);

  const [skills, setSkills] = useState<Skill[]>([{
    id: '1',
    name: '',
    level: ''
  }]);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setPersonalInfo(initialData.personalInfo || personalInfo);
      setWorkExperience(initialData.workExperience || workExperience);
      setEducation(initialData.education || education);
      setSkills(initialData.skills || skills);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (onSave) {
      await onSave({ personalInfo, workExperience, education, skills });
    }
  };

  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setWorkExperience(workExperience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      school: '',
      degree: '',
      startDate: '',
      endDate: ''
    }]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addSkill = () => {
    setSkills([...skills, {
      id: Date.now().toString(),
      name: '',
      level: ''
    }]);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const handleDownloadPDF = () => {
    generatePDF({ personalInfo, workExperience, education, skills });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Resume Builder
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create a professional resume with our easy-to-use builder. Customize sections, 
            add your experience, and download as PDF.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                    placeholder="Brief summary of your professional background..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button onClick={addWorkExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience {workExperience.indexOf(exp) + 1}</h4>
                      {workExperience.length > 1 && (
                        <Button
                          onClick={() => removeWorkExperience(exp.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="Present"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button onClick={addEducation} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Education {education.indexOf(edu) + 1}</h4>
                      {education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(edu.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>School/University</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <Button onClick={addSkill} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Skill</Label>
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        placeholder="JavaScript, Project Management, etc."
                      />
                    </div>
                    <div className="w-32">
                      <Label>Level</Label>
                      <Input
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                        placeholder="Expert, Intermediate"
                      />
                    </div>
                    {skills.length > 1 && (
                      <Button
                        onClick={() => removeSkill(skill.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resume Preview</CardTitle>
                <div className="flex gap-2">
                  {onSave && !readonly && (
                    <Button onClick={handleSave} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  )}
                  <Button onClick={handleDownloadPDF} className="bg-gradient-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="resume-preview" className="bg-white p-8 rounded-lg min-h-[800px] text-sm">
                  {/* Personal Info Header */}
                  <div className="text-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {personalInfo.name || 'Your Name'}
                    </h1>
                    <div className="text-gray-600 space-y-1">
                      {personalInfo.email && <div>{personalInfo.email}</div>}
                      {personalInfo.phone && <div>{personalInfo.phone}</div>}
                      {personalInfo.location && <div>{personalInfo.location}</div>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b">
                        Professional Summary
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Work Experience */}
                  {workExperience.some(exp => exp.company || exp.position) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Work Experience
                      </h2>
                      <div className="space-y-4">
                        {workExperience.filter(exp => exp.company || exp.position).map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {exp.position || 'Position'}
                                </h3>
                                <div className="text-gray-600">
                                  {exp.company || 'Company'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </div>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 mt-2 leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.some(edu => edu.school || edu.degree) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Education
                      </h2>
                      <div className="space-y-3">
                        {education.filter(edu => edu.school || edu.degree).map((edu) => (
                          <div key={edu.id} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {edu.degree || 'Degree'}
                              </h3>
                              <div className="text-gray-600">
                                {edu.school || 'School'}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {edu.startDate} - {edu.endDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.some(skill => skill.name) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Skills
                      </h2>
                      <div className="grid grid-cols-2 gap-2">
                        {skills.filter(skill => skill.name).map((skill) => (
                          <div key={skill.id} className="flex justify-between">
                            <span className="text-gray-700">{skill.name}</span>
                            {skill.level && (
                              <span className="text-gray-500 text-sm">{skill.level}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;