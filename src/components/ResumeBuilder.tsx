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
import { PhotoCrop } from '@/components/PhotoCrop';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
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
  level?: string;
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
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');

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

      if (error) throw error;
      
      callback(result.description);
      toast.success('AI description generated successfully!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate AI description. Please try again.');
    } finally {
      setLoadingAI(null);
    }
  };

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

  const addAircraftExperience = () => {
    setAircraftExperience([...aircraftExperience, { 
      id: Date.now().toString(), 
      aircraftModel: '', 
      hoursFlown: '', 
      typeRated: false, 
      lastFlown: '' 
    }]);
  };

  const removeAircraftExperience = (id: string) => {
    setAircraftExperience(aircraftExperience.filter(aircraft => aircraft.id !== id));
  };

  const updateAircraftExperience = (id: string, field: keyof AircraftExperience, value: any) => {
    setAircraftExperience(aircraftExperience.map(aircraft => 
      aircraft.id === id ? { ...aircraft, [field]: value } : aircraft
    ));
  };

  const addLanguageProficiency = () => {
    setLanguageProficiency([...languageProficiency, { language: '', icaoLevel: '', expiryDate: '' }]);
  };

  const removeLanguageProficiency = (index: number) => {
    setLanguageProficiency(languageProficiency.filter((_, i) => i !== index));
  };

  const updateLanguageProficiency = (index: number, field: keyof LanguageProficiency, value: string) => {
    const updated = [...languageProficiency];
    updated[index] = { ...updated[index], [field]: value };
    setLanguageProficiency(updated);
  };

  const addTraining = () => {
    setTraining([...training, { 
      id: Date.now().toString(), 
      trainingName: '', 
      provider: '', 
      completionDate: '', 
      expiryDate: '' 
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

  const handleSkillToggle = (skillId: string) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, selected: !skill.selected } : skill
    ));
  };

  const handlePhotoUpload = (imageUrl: string) => {
    setTempImageUrl(imageUrl);
    setCropDialogOpen(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setPersonalInfo({ ...personalInfo, profilePhoto: croppedImageUrl });
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
      skills 
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Aviation Resume Builder</h1>
            <div className="flex gap-2">
              {!readonly && onSave && (
                <Button onClick={handleSave} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
              <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                    placeholder="Captain John Doe"
                  />
                </div>
                <div>
                  <Label>Profile Photo</Label>
                  <PhotoUpload 
                    onImageUpload={handlePhotoUpload}
                    currentImage={personalInfo.profilePhoto}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    placeholder="captain.doe@airline.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                    placeholder="Los Angeles, CA"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Professional Summary</Label>
                  <Textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                    placeholder="Experienced airline pilot with over 10,000 flight hours..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications & Licenses */}
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications & Licenses
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
                    <h4 className="font-medium">License {certifications.indexOf(cert) + 1}</h4>
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
                      <Label>Issuing Authority</Label>
                      <Input
                        value={cert.issuingAuthority}
                        onChange={(e) => updateCertification(cert.id, 'issuingAuthority', e.target.value)}
                        placeholder="FAA, EASA, etc."
                      />
                    </div>
                    <div>
                      <Label>Certificate Number</Label>
                      <Input
                        value={cert.certificateNumber}
                        onChange={(e) => updateCertification(cert.id, 'certificateNumber', e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <DatePicker 
                        date={cert.expiryDate ? new Date(cert.expiryDate) : undefined}
                        onDateChange={(date) => updateCertification(cert.id, 'expiryDate', date ? format(date, "yyyy-MM-dd") : '')}
                        placeholder="Pick expiry date"
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
                    placeholder="10000"
                    type="number"
                  />
                </div>
                <div>
                  <Label>PIC Time</Label>
                  <Input
                    value={flightHours.picTime}
                    onChange={(e) => setFlightHours({...flightHours, picTime: e.target.value})}
                    placeholder="8500"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Simulator Time</Label>
                  <Input
                    value={flightHours.simulatorTime}
                    onChange={(e) => setFlightHours({...flightHours, simulatorTime: e.target.value})}
                    placeholder="500"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Instrument Time</Label>
                  <Input
                    value={flightHours.instrumentTime}
                    onChange={(e) => setFlightHours({...flightHours, instrumentTime: e.target.value})}
                    placeholder="2000"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Cross Country Time</Label>
                  <Input
                    value={flightHours.crossCountryTime}
                    onChange={(e) => setFlightHours({...flightHours, crossCountryTime: e.target.value})}
                    placeholder="7500"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Night Time</Label>
                  <Input
                    value={flightHours.nightTime}
                    onChange={(e) => setFlightHours({...flightHours, nightTime: e.target.value})}
                    placeholder="1500"
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
                          placeholder="Enter custom aircraft model"
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
                      <DatePicker 
                        date={aircraft.lastFlown ? new Date(aircraft.lastFlown) : undefined}
                        onDateChange={(date) => updateAircraftExperience(aircraft.id, 'lastFlown', date ? format(date, "yyyy-MM-dd") : '')}
                        placeholder="Pick last flown date"
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
                  <DatePicker 
                    date={medicalInfo.dateOfIssue ? new Date(medicalInfo.dateOfIssue) : undefined}
                    onDateChange={(date) => setMedicalInfo({...medicalInfo, dateOfIssue: date ? format(date, "yyyy-MM-dd") : ''})}
                    placeholder="Pick issue date"
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <DatePicker 
                    date={medicalInfo.expiryDate ? new Date(medicalInfo.expiryDate) : undefined}
                    onDateChange={(date) => setMedicalInfo({...medicalInfo, expiryDate: date ? format(date, "yyyy-MM-dd") : ''})}
                    placeholder="Pick expiry date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Crop Dialog */}
          <PhotoCrop
            open={cropDialogOpen}
            onOpenChange={setCropDialogOpen}
            imageSrc={tempImageUrl}
            onCropComplete={handleCropComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
