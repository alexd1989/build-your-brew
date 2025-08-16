import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  users: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const templates: Template[] = [
  {
    id: 'carver',
    name: 'Carver',
    description: 'Clean and professional design with balanced typography',
    users: '5,000+ users chose this template',
    preview: 'Modern, clean layout with subtle accents',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6'
    }
  },
  {
    id: 'tesla',
    name: 'Tesla',
    description: 'Bold and modern with strong visual hierarchy',
    users: '9,000+ users chose this template',
    preview: 'Contemporary design with bold headings',
    colors: {
      primary: '#111827',
      secondary: '#4b5563',
      accent: '#ef4444'
    }
  },
  {
    id: 'franklin',
    name: 'Franklin',
    description: 'Classic and traditional with elegant typography',
    users: '5,000+ users chose this template',
    preview: 'Timeless design with serif fonts',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#059669'
    }
  },
  {
    id: 'edison',
    name: 'Edison',
    description: 'Creative and distinctive with unique layout',
    users: '24,000+ users chose this template',
    preview: 'Innovative layout with creative elements',
    colors: {
      primary: '#1e293b',
      secondary: '#64748b',
      accent: '#8b5cf6'
    }
  },
  {
    id: 'curie',
    name: 'Curie',
    description: 'Minimalist and sophisticated with clean lines',
    users: '15,000+ users chose this template',
    preview: 'Minimal design with focus on content',
    colors: {
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#06b6d4'
    }
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onContinue?: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onContinue
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose a template you like
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your template from our expertly designed collection.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:scale-105'
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              {/* Selected Checkmark */}
              {selectedTemplate === template.id && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Template Preview */}
              <div className="relative overflow-hidden">
                <div 
                  className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 border-b"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.accent}15)`
                  }}
                >
                  {/* Template Preview Content */}
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div 
                        className="h-3 rounded mb-2"
                        style={{ backgroundColor: template.colors.primary, width: '60%' }}
                      />
                      <div 
                        className="h-2 rounded mb-1"
                        style={{ backgroundColor: template.colors.secondary, width: '80%' }}
                      />
                      <div 
                        className="h-2 rounded mb-1"
                        style={{ backgroundColor: template.colors.secondary, width: '70%' }}
                      />
                      <div 
                        className="h-2 rounded mb-1"
                        style={{ backgroundColor: template.colors.secondary, width: '50%' }}
                      />
                    </div>
                    <div>
                      <div 
                        className="h-2 rounded mb-1"
                        style={{ backgroundColor: template.colors.accent, width: '40%' }}
                      />
                      <div 
                        className="h-2 rounded mb-1"
                        style={{ backgroundColor: template.colors.secondary, width: '90%' }}
                      />
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: template.colors.secondary, width: '75%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.users}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onContinue}
            disabled={!selectedTemplate}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {selectedTemplate ? `Use ${templates.find(t => t.id === selectedTemplate)?.name} Template` : 'Select a Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
export type { Template };
