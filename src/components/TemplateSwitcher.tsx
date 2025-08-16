import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { templates } from './TemplateSelector';

interface TemplateSwitcherProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <Palette className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedTemplate} onValueChange={onTemplateChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: template.colors.primary }}
                />
                {template.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateSwitcher;
