import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexa_ui/shared';
import { Copy, Sun, Moon, Upload } from 'lucide-react';
import { Input } from '@nexa_ui/shared';
import { lazy, Suspense } from 'react';
import { Label } from '@nexa_ui/shared';
const CodeEditor = lazy(() =>
  import('@uiw/react-textarea-code-editor').then((mod) => ({
    default: mod.default,
  }))
);
import { Card, CardContent, CardHeader, CardTitle } from '@nexa_ui/shared';
import { Button } from '@nexa_ui/shared';
import { useTheme } from './theme-provider';
import { useToast } from '@nexa_ui/shared';

interface Action {
  code: string;
  created_at?: string;
  description: string;
  aid: string;
  language: string;
  title: string;
  updated_at?: string;
}

interface ActionFormProps {
  code: string;
  language: string;
  actionTitle: string;
  requirements: string;
  selectedToggle: string;
  actions: Action[];
  invalidPackages: string[];
  editingAction: Action | null;

  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setActionTitle: (title: string) => void;
  setRequirements: (requirements: string) => void;
  setActions: (actions: Action[]) => void;
  setEditingAction: (editingAction: Action | null) => void;
}

// Add this near the top of your file, outside of any component
const ALLOWED_PACKAGES = [
  'numpy',
  'pandas',
  'matplotlib',
  'scikit-learn',
  'requests',
  'beautifulsoup4',
  'pillow',
  'tensorflow',
  'pytorch',
  'scipy',
  'nltk',
  'opencv-python',
  'sqlalchemy',
  'flask',
  'django',
  // Add more safe packages as needed
];

function ActionsForm({
  code,
  language,
  actionTitle,
  requirements,
  invalidPackages,
  actions,
  editingAction,
  selectedToggle,
  setCode,
  setLanguage,
  setActionTitle,
  setRequirements,
  setActions,
  setEditingAction,
}: ActionFormProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const { theme, setTheme } = useTheme();
  const [editingIndex, setEditingIndex] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingAction) {
      setCode(editingAction.code);
      setLanguage(editingAction.language);
      setActionTitle(editingAction.title);
      setEditingIndex(editingAction.aid);
    }
  }, [editingAction]);

  async function createAction(
    title: string,
    code: string,
    language: string,
    requirements?: string
  ): Promise<{ message: string; actions: Action[] }> {
    const response = await fetch('http://localhost:8000/api/v1/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, code, language, requirements }),
    });
    return await response.json();
  }

  const validateRequirements = (input: string) => {
    const packageSpecs = input.split(',').map((pkg) => pkg.trim());
    const invalid = packageSpecs.filter((spec) => {
      const [packageName] = spec.split(/[=<>]/);
      return !ALLOWED_PACKAGES.includes(packageName.toLowerCase());
    });
    // setInvalidPackages(invalid);
    return invalid.length === 0;
  };

  function setInvalidPackages(invalid: string[]) {
    throw new Error('Function not implemented.');
  }

  const handleEdit = async () => {
    if (!editingAction) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/actions/${editingAction.aid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language,
            title: actionTitle,
            requirements,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the local actions list with the updated action
        const updatedActions = actions.map((action) =>
          action.aid === editingAction.aid
            ? { ...action, code, language, title: actionTitle, requirements }
            : action
        );
        setActions(updatedActions);

        // Clear the form and the editing state
        setEditingAction(null);
        setCode('');
        setLanguage('python');
        setActionTitle('');
        setRequirements('requests');

        toast({
          title: 'Action Updated',
          description: `The action ${data.action.title} has been updated successfully.`,
          duration: 3000,
        });
      } else {
        throw new Error(data.message || 'Failed to update action');
      }
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the action. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleCreateAction = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateRequirements(requirements)) {
      toast({
        title: 'Invalid packages',
        description: `The following package specifications are not allowed: ${invalidPackages.join(
          ', '
        )}`,
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    const newAction = await createAction(
      actionTitle,
      code,
      language,
      requirements
    );
    console.log(newAction);
    setActions([...actions, ...newAction.actions]);
    setActionTitle('');
    setCode('# Enter your Python code here');
    setRequirements('');
    // setInvalidPackages([]);
  };


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
    console.log('File selected:', file?.name);
  };


  return (
    <>
      <Card className={`w-2/3 flex flex-col`}>
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle>
            {selectedToggle === 'action' ? 'Crete Actions' : 'Upload Douments'}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {selectedToggle === 'action' ? (
          <CardContent className="flex-grow flex flex-col overflow-hidden">
            <div className="mb-4 flex-shrink-0 flex items-end space-x-4">
              <div className="flex-grow">
                <Label htmlFor="action-title">Action Title</Label>
                <Input
                  id="action-title"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="Enter action title"
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor="language-select">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4 flex-shrink-0">
              <Label htmlFor="requirements">
                Requirements (comma-separated)
              </Label>
              <Input
                id="requirements"
                value={requirements}
                onChange={(e) => {
                  setRequirements(e.target.value);
                }}
                placeholder="Enter allowed packages (e.g., numpy, pandas==1.2.3, sqlalchemy>=1.4)"
              />
              {invalidPackages.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Invalid package specifications: {invalidPackages.join(', ')}
                </p>
              )}
            </div>
            <Suspense fallback={<div>Loading editor...</div>}>
              <div className="flex-grow overflow-auto">
                <CodeEditor
                  value={code}
                  language={language}
                  placeholder="Please enter code."
                  onChange={(evn) => setCode(evn.target.value)}
                  padding={15}
                  style={{
                    fontSize: 14,
                    backgroundColor: 'var(--background)',
                    fontFamily:
                      'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    minHeight: '100%', // Changed from height to minHeight
                  }}
                  className="border rounded-md w-full"
                />
              </div>
            </Suspense>
            <Button
              onClick={editingAction ? handleEdit : handleCreateAction}
              className="w-full mt-4"
            >
              Create Action
            </Button>
          </CardContent>
        ) : (
          <div className="p-4 border-t mt-auto h-full">
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full h-full"
            >
              <Upload className="w-4 mr-2" />
              Upload File
            </Button>
            {selectedFile && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

export default ActionsForm;
