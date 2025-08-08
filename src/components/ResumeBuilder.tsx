import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { Plus, Trash2, Download, Save, Plane, Award, Clock, Shield, Sparkles } from 'lucide-react';
import { generatePDF } from '@/lib/pdf-generator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  profilePhoto?: string;
}

interface Certification {
  id: string;
  licenseType: string;
  issuingAuthority: string;
  expiryDate: string;
  certificateNumber: string;
}

interface FlightHours {
  totalTime: string;
  picTime: string;
  simulatorTime: string;
  instrumentTime: string;
  crossCountryTime: string;
  nightTime: string;
}

interface AircraftExperience {
  id: string;
  aircraftModel: string;
  customAircraftModel?: string;
  hoursFlown: string;
  typeRated: boolean;
  lastFlown: string;
  description?: string;
}

interface MedicalInfo {
  medicalClass: string;
  dateOfIssue: string;
  expiryDate: string;
  issuingAuthority: string;
}

interface LanguageProficiency {
  language: string;
  icaoLevel: string;
  expiryDate: string;
}

interface Training {
  id: string;
  trainingName: string;
  customTrainingName?: string;
  provider: string;
  completionDate: string;
  expiryDate: string;
  description?: string;
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
  selected: boolean;
}

interface ResumeBuilderProps {
  initialData?: any;
  onSave?: (content: any) => Promise<void>;
  readonly?: boolean;
}

// Aviation constants
const LICENSE_TYPES = ['PPL', 'CPL', 'ATPL', 'MPL', 'SPL', 'RPL'];
const MEDICAL_CLASSES = ['Class 1', 'Class 2', 'Class 3'];
const ICAO_LEVELS = ['1', '2', '3', '4', '5', '6'];
const AIRCRAFT_MODELS = [
  'Airbus A320', 'Airbus A330', 'Airbus A340', 'Airbus A350', 'Airbus A380',
  'Boeing 737', 'Boeing 747', 'Boeing 757', 'Boeing 767', 'Boeing 777', 'Boeing 787',
  'Embraer E-Jets', 'Bombardier CRJ', 'ATR 72', 'Cessna 172', 'Cessna 208',
  'Beechcraft King Air', 'Piper PA-28', 'Diamond DA40', 'Cirrus SR22', 'Other'
];
const AVIATION_SKILLS = [
  'Crew Resource Management (CRM)', 'Communication', 'Leadership', 'Safety Awareness',
  'Problem Solving', 'Situational Awareness', 'Teamwork', 'Decision Making',
  'Stress Management', 'Customer Service', 'Emergency Response', 'Weather Assessment'
];
const TRAINING_TYPES = [
  'Initial Type Rating', 'Recurrent Training', 'Line Training', 'Simulator Training',
  'CRM Training', 'Emergency Procedures', 'Security Training', 'Dangerous Goods',
  'Fire Fighting', 'First Aid/CPR', 'Upset Prevention and Recovery', 'ETOPS Training', 'Other'
];

const ResumeBuilder = ({ initialData, onSave, readonly = false }: ResumeBuilderProps) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    profilePhoto: undefined
  });

  const [certifications, setCertifications] = useState<Certification[]>([{
    id: '1',
    licenseType: '',
    issuingAuthority: '',
    expiryDate: '',
    certificateNumber: ''
  }]);

  const [flightHours, setFlightHours] = useState<FlightHours>({
    totalTime: '',
    picTime: '',
    simulatorTime: '',
    instrumentTime: '',
    crossCountryTime: '',
    nightTime: ''
  });

  const [aircraftExperience, setAircraftExperience] = useState<AircraftExperience[]>([{
    id: '1',
    aircraftModel: '',
    hoursFlown: '',
    typeRated: false,
    lastFlown: ''
  }]);

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    medicalClass: '',
    dateOfIssue: '',
    expiryDate: '',
    issuingAuthority: ''
  });

  const [languageProficiency, setLanguageProficiency] = useState<LanguageProficiency[]>([{
    language: 'English',
    icaoLevel: '',
    expiryDate: ''
  }]);

  const [training, setTraining] = useState<Training[]>([{
    id: '1',
    trainingName: '',
    provider: '',
    completionDate: '',
    expiryDate: ''
  }]);

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

  const [skills, setSkills] = useState<Skill[]>(
    AVIATION_SKILLS.map((skill, index) => ({
      id: (index + 1).toString(),
      name: skill,
      selected: false
    }))
  );

  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setPersonalInfo(initialData.personalInfo || personalInfo);
      setCertifications(initialData.certifications || certifications);
      setFlightHours(initialData.flightHours || flightHours);
      setAircraftExperience(initialData.aircraftExperience || aircraftExperience);
      setMedicalInfo(initialData.medicalInfo || medicalInfo);
      setLanguageProficiency(initialData.languageProficiency || languageProficiency);
      setTraining(initialData.training || training);
      setWorkExperience(initialData.workExperience || workExperience);
      setEducation(initialData.education || education);
      setSkills(initialData.skills || skills);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (onSave) {
      await onSave({ 
        personalInfo, 
        certifications, 
        flightHours, 
        aircraftExperience, 
        medicalInfo, 
        languageProficiency, 
        training, 
        workExperience, 
        education, 
        skills 
      });
    }
  };

  const generateAIDescription = async (sectionType: string, data: any, callback: (description: string) => void) => {
    setLoadingAI(sectionType);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-description', {
        body: { sectionType, data }
      });

      if (error) {
        throw error;
      }

      if (result?.description) {
        callback(result.description);
        toast.success('AI description generated successfully!');
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate AI description. Please try again.');
    } finally {
      setLoadingAI(null);
    }
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([...certifications, {
      id: Date.now().toString(),
      licenseType: '',
      issuingAuthority: '',
      expiryDate: '',
      certificateNumber: ''
    }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  // Aircraft experience handlers
  const addAircraftExperience = () => {
    setAircraftExperience([...aircraftExperience, {
      id: Date.now().toString(),
      aircraftModel: '',
      customAircraftModel: '',
      hoursFlown: '',
      typeRated: false,
      lastFlown: '',
      description: ''
    }]);
  };

  const removeAircraftExperience = (id: string) => {
    setAircraftExperience(aircraftExperience.filter(exp => exp.id !== id));
  };

  const updateAircraftExperience = (id: string, field: keyof AircraftExperience, value: any) => {
    setAircraftExperience(aircraftExperience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  // Language proficiency handlers
  const addLanguageProficiency = () => {
    setLanguageProficiency([...languageProficiency, {
      language: '',
      icaoLevel: '',
      expiryDate: ''
    }]);
  };

  const removeLanguageProficiency = (index: number) => {
    setLanguageProficiency(languageProficiency.filter((_, i) => i !== index));
  };

  const updateLanguageProficiency = (index: number, field: keyof LanguageProficiency, value: string) => {
    setLanguageProficiency(languageProficiency.map((lang, i) => 
      i === index ? { ...lang, [field]: value } : lang
    ));
  };

  // Training handlers
  const addTraining = () => {
    setTraining([...training, {
      id: Date.now().toString(),
      trainingName: '',
      customTrainingName: '',
      provider: '',
      completionDate: '',
      expiryDate: '',
      description: ''
    }]);
  };

  const removeTraining = (id: string) => {
    setTraining(training.filter(train => train.id !== id));
  };

  const updateTraining = (id: string, field: keyof Training, value: string) => {
    setTraining(training.map(train => 
      train.id === id ? { ...train, [field]: value } : train
    ));
  };

  // Work experience handlers
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

  // Education handlers
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

  // Skills handlers
  const handleSkillsChange = (selectedValues: string[]) => {
    setSkills(skills.map(skill => ({
      ...skill,
      selected: selectedValues.includes(skill.name)
    })));
  };

  const handleDownloadPDF = () => {
    generatePDF({ 
      personalInfo, 
      certifications, 
      flightHours, 
      aircraftExperience, 
      medicalInfo, 
      languageProficiency, 
      training, 
      workExperience, 
      education, 
      skills: skills.filter(skill => skill.selected)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <Plane className="w-10 h-10" />
            Aviation Resume Builder
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create a professional aviation resume tailored for pilots and cabin crew. 
            Include certifications, flight hours, aircraft experience, and aviation-specific qualifications.
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
                <div className="text-center mb-6">
                  <Label>Profile Photo</Label>
                  <PhotoUpload
                    value={personalInfo.profilePhoto}
                    onChange={(value) => setPersonalInfo({...personalInfo, profilePhoto: value || undefined})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      placeholder="Captain John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      placeholder="captain.smith@airline.com"
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
                    <Label htmlFor="location">Base Location</Label>
                    <Input
                      id="location"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                      placeholder="JFK International Airport, NY"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                    placeholder="Experienced airline pilot with extensive flight hours and safety record..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Licenses & Certifications
                </CardTitle>
                <Button onClick={addCertification} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Certification {certifications.indexOf(cert) + 1}</h4>
                      {certifications.length > 1 && (
                        <Button
                          onClick={() => removeCertification(cert.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>License Type</Label>
                        <Select
                          value={cert.licenseType}
                          onValueChange={(value) => updateCertification(cert.id, 'licenseType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select license type" />
                          </SelectTrigger>
                          <SelectContent>
                            {LICENSE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Certificate Number</Label>
                        <Input
                          value={cert.certificateNumber}
                          onChange={(e) => updateCertification(cert.id, 'certificateNumber', e.target.value)}
                          placeholder="Certificate number"
                        />
                      </div>
                      <div>
                        <Label>Issuing Authority</Label>
                        <Input
                          value={cert.issuingAuthority}
                          onChange={(e) => updateCertification(cert.id, 'issuingAuthority', e.target.value)}
                          placeholder="FAA, EASA, CASA, etc."
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Flight Hours */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Flight Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Time</Label>
                    <Input
                      value={flightHours.totalTime}
                      onChange={(e) => setFlightHours({...flightHours, totalTime: e.target.value})}
                      placeholder="5000"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>PIC Time</Label>
                    <Input
                      value={flightHours.picTime}
                      onChange={(e) => setFlightHours({...flightHours, picTime: e.target.value})}
                      placeholder="2500"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Simulator Time</Label>
                    <Input
                      value={flightHours.simulatorTime}
                      onChange={(e) => setFlightHours({...flightHours, simulatorTime: e.target.value})}
                      placeholder="200"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Instrument Time</Label>
                    <Input
                      value={flightHours.instrumentTime}
                      onChange={(e) => setFlightHours({...flightHours, instrumentTime: e.target.value})}
                      placeholder="800"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Cross Country Time</Label>
                    <Input
                      value={flightHours.crossCountryTime}
                      onChange={(e) => setFlightHours({...flightHours, crossCountryTime: e.target.value})}
                      placeholder="1500"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Night Time</Label>
                    <Input
                      value={flightHours.nightTime}
                      onChange={(e) => setFlightHours({...flightHours, nightTime: e.target.value})}
                      placeholder="300"
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aircraft Experience */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Aircraft Experience
                </CardTitle>
                <Button onClick={addAircraftExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {aircraftExperience.map((aircraft) => (
                  <div key={aircraft.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Aircraft {aircraftExperience.indexOf(aircraft) + 1}</h4>
                      {aircraftExperience.length > 1 && (
                        <Button
                          onClick={() => removeAircraftExperience(aircraft.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Aircraft Model</Label>
                        <Select
                          value={aircraft.aircraftModel}
                          onValueChange={(value) => updateAircraftExperience(aircraft.id, 'aircraftModel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select aircraft model" />
                          </SelectTrigger>
                          <SelectContent>
                            {AIRCRAFT_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {aircraft.aircraftModel === 'Other' && (
                        <div>
                          <Label>Custom Aircraft Model</Label>
                          <Input
                            value={aircraft.customAircraftModel || ''}
                            onChange={(e) => updateAircraftExperience(aircraft.id, 'customAircraftModel', e.target.value)}
                            placeholder="Enter aircraft model"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Hours Flown</Label>
                        <Input
                          value={aircraft.hoursFlown}
                          onChange={(e) => updateAircraftExperience(aircraft.id, 'hoursFlown', e.target.value)}
                          placeholder="1200"
                          type="number"
                        />
                      </div>
                      <div>
                        <Label>Last Flown</Label>
                        <Input
                          type="date"
                          value={aircraft.lastFlown}
                          onChange={(e) => updateAircraftExperience(aircraft.id, 'lastFlown', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`typeRated-${aircraft.id}`}
                          checked={aircraft.typeRated}
                          onCheckedChange={(checked) => updateAircraftExperience(aircraft.id, 'typeRated', checked)}
                        />
                        <Label htmlFor={`typeRated-${aircraft.id}`}>Type Rated</Label>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label>Description</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => generateAIDescription('aircraftExperience', aircraft, (description) => 
                            updateAircraftExperience(aircraft.id, 'description', description)
                          )}
                          disabled={loadingAI === 'aircraftExperience'}
                          className="text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {loadingAI === 'aircraftExperience' ? 'Generating...' : 'Generate with AI'}
                        </Button>
                      </div>
                      <Textarea
                        value={aircraft.description || ''}
                        onChange={(e) => updateAircraftExperience(aircraft.id, 'description', e.target.value)}
                        placeholder="Brief description of experience with this aircraft..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Medical Class */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Medical Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Medical Class</Label>
                    <Select
                      value={medicalInfo.medicalClass}
                      onValueChange={(value) => setMedicalInfo({...medicalInfo, medicalClass: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medical class" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Issuing Authority</Label>
                    <Input
                      value={medicalInfo.issuingAuthority}
                      onChange={(e) => setMedicalInfo({...medicalInfo, issuingAuthority: e.target.value})}
                      placeholder="FAA, EASA, etc."
                    />
                  </div>
                  <div>
                    <Label>Date of Issue</Label>
                    <Input
                      type="date"
                      value={medicalInfo.dateOfIssue}
                      onChange={(e) => setMedicalInfo({...medicalInfo, dateOfIssue: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={medicalInfo.expiryDate}
                      onChange={(e) => setMedicalInfo({...medicalInfo, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Proficiency */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Language Proficiency (ICAO)</CardTitle>
                <Button onClick={addLanguageProficiency} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {languageProficiency.map((lang, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Language {index + 1}</h4>
                      {languageProficiency.length > 1 && (
                        <Button
                          onClick={() => removeLanguageProficiency(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Language</Label>
                        <Input
                          value={lang.language}
                          onChange={(e) => updateLanguageProficiency(index, 'language', e.target.value)}
                          placeholder="English, French, Spanish"
                        />
                      </div>
                      <div>
                        <Label>ICAO Level</Label>
                        <Select
                          value={lang.icaoLevel}
                          onValueChange={(value) => updateLanguageProficiency(index, 'icaoLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {ICAO_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>Level {level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={lang.expiryDate}
                          onChange={(e) => updateLanguageProficiency(index, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Training */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Training & Recertification</CardTitle>
                <Button onClick={addTraining} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {training.map((train) => (
                  <div key={train.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Training {training.indexOf(train) + 1}</h4>
                      {training.length > 1 && (
                        <Button
                          onClick={() => removeTraining(train.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Training Type</Label>
                        <Select
                          value={train.trainingName}
                          onValueChange={(value) => updateTraining(train.id, 'trainingName', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select training type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRAINING_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Training Provider</Label>
                        <Input
                          value={train.provider}
                          onChange={(e) => updateTraining(train.id, 'provider', e.target.value)}
                          placeholder="FlightSafety, CAE, etc."
                        />
                      </div>
                      <div>
                        <Label>Completion Date</Label>
                        <Input
                          type="date"
                          value={train.completionDate}
                          onChange={(e) => updateTraining(train.id, 'completionDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={train.expiryDate}
                          onChange={(e) => updateTraining(train.id, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Aviation Skills */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <CardTitle>Aviation Skills & Competencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Select Aviation Skills & Competencies</Label>
                    <MultiSelect
                      options={skills.map(skill => ({ label: skill.name, value: skill.name }))}
                      value={skills.filter(skill => skill.selected).map(skill => skill.name)}
                      onChange={handleSkillsChange}
                      placeholder="Select skills..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aviation Experience</CardTitle>
                <Button onClick={addWorkExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Position {workExperience.indexOf(exp) + 1}</h4>
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
                        <Label>Airline/Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                          placeholder="Delta Airlines, Emirates, etc."
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                          placeholder="Captain, First Officer, Flight Attendant"
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
                      <div className="flex items-center gap-2 mb-2">
                        <Label>Description</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => generateAIDescription('workExperience', exp, (description) => 
                            updateWorkExperience(exp.id, 'description', description)
                          )}
                          disabled={loadingAI === 'workExperience'}
                          className="text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {loadingAI === 'workExperience' ? 'Generating...' : 'Generate with AI'}
                        </Button>
                      </div>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your aviation responsibilities, aircraft operated, routes flown..."
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
                <CardTitle>Education & Aviation Training</CardTitle>
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
                        <Label>Institution</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          placeholder="Flight Training Academy, University"
                        />
                      </div>
                      <div>
                        <Label>Degree/Certification</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Aviation Management, Commercial Pilot License"
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
                  <div className="flex items-start gap-6 mb-8 pb-6 border-b">
                    {/* Profile Photo */}
                    {personalInfo.profilePhoto && (
                      <div className="flex-shrink-0">
                        <img 
                          src={personalInfo.profilePhoto} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                        />
                      </div>
                    )}
                    
                    {/* Personal Info */}
                    <div className={personalInfo.profilePhoto ? "flex-1" : "text-center w-full"}>
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        {personalInfo.name || 'Your Name'}
                      </h1>
                      <div className="text-gray-600 space-y-1 leading-relaxed">
                        {personalInfo.email && <div>{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.location && <div>{personalInfo.location}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {personalInfo.summary && (
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Professional Summary
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Certifications */}
                  {certifications.some(cert => cert.licenseType || cert.certificateNumber) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Licenses & Certifications
                      </h2>
                      <div className="space-y-3">
                        {certifications.filter(cert => cert.licenseType || cert.certificateNumber).map((cert) => (
                          <div key={cert.id} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {cert.licenseType}
                              </h3>
                              <div className="text-gray-600 text-sm">
                                {cert.certificateNumber && `Certificate: ${cert.certificateNumber}`}
                                {cert.issuingAuthority && ` • Issued by: ${cert.issuingAuthority}`}
                              </div>
                            </div>
                            {cert.expiryDate && (
                              <div className="text-sm text-gray-500">
                                Expires: {cert.expiryDate}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flight Hours */}
                  {(flightHours.totalTime || flightHours.picTime) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Flight Hours
                      </h2>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {flightHours.totalTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Total Time:</span>
                            <span className="text-gray-700">{flightHours.totalTime} hrs</span>
                          </div>
                        )}
                        {flightHours.picTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">PIC Time:</span>
                            <span className="text-gray-700">{flightHours.picTime} hrs</span>
                          </div>
                        )}
                        {flightHours.simulatorTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Simulator:</span>
                            <span className="text-gray-700">{flightHours.simulatorTime} hrs</span>
                          </div>
                        )}
                        {flightHours.instrumentTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Instrument:</span>
                            <span className="text-gray-700">{flightHours.instrumentTime} hrs</span>
                          </div>
                        )}
                        {flightHours.crossCountryTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Cross Country:</span>
                            <span className="text-gray-700">{flightHours.crossCountryTime} hrs</span>
                          </div>
                        )}
                        {flightHours.nightTime && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Night:</span>
                            <span className="text-gray-700">{flightHours.nightTime} hrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aircraft Experience */}
                  {aircraftExperience.some(aircraft => aircraft.aircraftModel || aircraft.hoursFlown) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Aircraft Experience
                      </h2>
                      <div className="space-y-3">
                        {aircraftExperience.filter(aircraft => aircraft.aircraftModel || aircraft.hoursFlown).map((aircraft) => (
                          <div key={aircraft.id} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {aircraft.aircraftModel}
                                {aircraft.typeRated && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Type Rated</span>}
                              </h3>
                              <div className="text-gray-600 text-sm">
                                {aircraft.hoursFlown && `${aircraft.hoursFlown} hours`}
                                {aircraft.lastFlown && ` • Last flown: ${aircraft.lastFlown}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medical Certificate */}
                  {medicalInfo.medicalClass && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Medical Certificate
                      </h2>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{medicalInfo.medicalClass}</span>
                          <span className="text-gray-500">
                            {medicalInfo.expiryDate && `Expires: ${medicalInfo.expiryDate}`}
                          </span>
                        </div>
                        {medicalInfo.issuingAuthority && (
                          <div className="text-gray-600 mt-1">
                            Issued by: {medicalInfo.issuingAuthority}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Language Proficiency */}
                  {languageProficiency.some(lang => lang.language || lang.icaoLevel) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Language Proficiency (ICAO)
                      </h2>
                      <div className="space-y-2">
                        {languageProficiency.filter(lang => lang.language || lang.icaoLevel).map((lang, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-900">{lang.language}</span>
                            <div className="text-gray-600">
                              {lang.icaoLevel && `Level ${lang.icaoLevel}`}
                              {lang.expiryDate && ` • Expires: ${lang.expiryDate}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Training */}
                  {training.some(train => train.trainingName || train.provider) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Training & Recertification
                      </h2>
                      <div className="space-y-3">
                        {training.filter(train => train.trainingName || train.provider).map((train) => (
                          <div key={train.id} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {train.trainingName}
                              </h3>
                              <div className="text-gray-600 text-sm">
                                {train.provider && `Provider: ${train.provider}`}
                                {train.completionDate && ` • Completed: ${train.completionDate}`}
                              </div>
                            </div>
                            {train.expiryDate && (
                              <div className="text-sm text-gray-500">
                                Expires: {train.expiryDate}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aviation Skills */}
                  {skills.some(skill => skill.selected) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Aviation Skills & Competencies
                      </h2>
                      <div className="grid grid-cols-2 gap-2">
                        {skills.filter(skill => skill.selected).map((skill) => (
                          <div key={skill.id}>
                            <span className="text-gray-700">{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aviation Experience */}
                  {workExperience.some(exp => exp.company || exp.position) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b">
                        Aviation Experience
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
                               <p className="text-gray-700 mt-3 leading-relaxed text-sm">
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
                        Education & Aviation Training
                      </h2>
                      <div className="space-y-3">
                        {education.filter(edu => edu.school || edu.degree).map((edu) => (
                          <div key={edu.id} className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {edu.degree || 'Degree'}
                              </h3>
                              <div className="text-gray-600">
                                {edu.school || 'Institution'}
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