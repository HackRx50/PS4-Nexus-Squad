import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexa_ui/shared';
import { Copy, Sun, Moon, Upload, Files } from 'lucide-react';
import { Input } from '@nexa_ui/shared';
import { lazy, Suspense } from 'react';
import { Label } from '@nexa_ui/shared';

import { Card, CardContent, CardHeader, CardTitle } from '@nexa_ui/shared';
import { Button } from '@nexa_ui/shared';
import { useTheme } from './theme-provider';
import { useToast } from '@nexa_ui/shared';
import { Action, DocumentMetaData } from '../types';
import { getActions, getDocuments } from '../utility';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { addActions, addDocumentMetaData } from '../store';
import { appFetch } from '../utility';
import Loading from './Loading';
import { Editor } from '@monaco-editor/react';

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
  'sqlalchemy',
];

const supportedExtensions = [
  'txt',
  'md',
  'docx',
  'xlsx',
  'pptx',
  'pdf',
  'html',
  'csv',
  'json',
];

const MAX_FILE_SIZE_MB = 10;

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
  const [draggedOver, setDraggedOver] = useState(false);

  const [actionSubmissionLoading, setActionSubmissionLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const { agent_name } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (editingAction) {
      setCode(editingAction.code);
      setLanguage(editingAction.language);
      setActionTitle(editingAction.title);
      setEditingIndex(editingAction.aid);
    }
  }, [editingAction]);

  useEffect(() => {
    if (error) {
      toast({
        title: error,
        duration: 3000,
        variant: 'destructive',
      });
    }
  }, [error]);

  async function createAction(
    title: string,
    code: string,
    language: string,
    requirements?: string
  ): Promise<{ message: string; count: number }> {
    setActionSubmissionLoading(true)
    const response = await appFetch(`/api/v1/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      agent_name,
      body: JSON.stringify({ title, code, language, requirements }),
    });
    return await response.json();
  }

  const validateRequirements = (input: string) => {
    if (input == "") return true;
    const packageSpecs = input.split(',').map((pkg) => pkg.trim());
    const invalid = packageSpecs.filter((spec) => {
      const [packageName] = spec.split(/[=<>]/);
      return !ALLOWED_PACKAGES.includes(packageName.toLowerCase());
    });
    return invalid.length === 0;
  };

  const handleEdit = async () => {
    if (!editingAction) return;

    try {
      const response = await appFetch(`/api/v1/actions/${editingAction.aid}`, {
        method: 'PUT',
        agent_name,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          title: actionTitle,
          requirements,
        }),
      });

      const data = await response.json();

      if (response.ok) {
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

  function checkValidPackages() {
    if (!validateRequirements(requirements)) {
      toast({
        title: 'Invalid packages',
        description: `The following package specifications are not allowed: ${invalidPackages.join(
          ', '
        )}`,
        variant: 'destructive',
        duration: 5000,
      });
      return false;
    }
    return true;
  }

  const handleCreateAction = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!checkValidPackages()) return;

    try {
      const newAction = await createAction(
        actionTitle,
        code,
        language,
        requirements
      );
      toast({
        title: 'Actions Created',
        description: newAction.message,
        variant: 'default',
        duration: 5000,
      });

      const actions = await getActions(agent_name!);
      dispatch(addActions({ agent_name: agent_name!, actions }));

      setActionTitle('');
      setCode('# Enter your Python code here');
      setRequirements('');
      setActionSubmissionLoading(false);
    } catch (err) {
      toast({
        title: 'Action Creation Error',
        description: `${err}`,
        variant: 'default',
        duration: 5000,
      });
      setActionSubmissionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      if (supportedExtensions.includes(fileExtension)) {
        if (file.size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
          setSelectedFile(file);
          setError(null); // Clear error if file is valid
        } else {
          setSelectedFile(null);
          setError('File size exceeds 10MB.');
        }
      } else {
        setSelectedFile(null);
        setError('Unsupported file type.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      if (supportedExtensions.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(true);
  };

  async function handleUpload(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    if (!selectedFile) {
      setError('No file selected.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File size exceeds 10MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await appFetch(`/api/v1/documents`, {
        agent_name,
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        setError(`Upload failed: ${error.detail}`);
        return;
      }

      const { data: documentMetaData, message } = await response.json();

      const documentsMetaData = await getDocuments(agent_name!);
      console.log(documentMetaData, agent_name);
      dispatch(
        addDocumentMetaData({
          agent_name: agent_name!,
          documents: documentsMetaData,
        })
      );

      toast({
        title: message,
        description: `Document with id is ${(documentMetaData as DocumentMetaData).did
          }`,
        variant: 'default',
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      setError(`Upload failed: ${(error as any).message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {uploading ? <Loading message='Uploading...' /> : ''}
      {actionSubmissionLoading ? <Loading message='Creating...' /> : ''}
      <Card className={`w-2/3 flex flex-col`}>
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle>
            {selectedToggle === 'action' ? 'Create Actions' : 'Upload Douments'}
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
                <Label className='mb-2' htmlFor="action-title">Action Title</Label>
                <Input
                  id="action-title"
                  value={actionTitle}
                  required={true}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="Enter action title"
                />
              </div>
              <div className="w-1/3">
                <Label className='mb-2' htmlFor="language-select">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    {/* <SelectItem value="javascript">JavaScript</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4 flex-shrink-0">
              <Label className='mb-2' htmlFor="requirements">
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
              <div className="flex-grow overflow-hidden">
                <Editor className='border rounded-md w-full' theme={theme === "dark" ? "vs-dark" : "light"} value={code} language='python' onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false } }} />
              </div>
            </Suspense>
            <Button
              onClick={handleCreateAction}
              className="w-full mt-4"
              disabled={actionSubmissionLoading}
            >
              Create Action
            </Button>
          </CardContent>
        ) : (
          <div className="p-4 border-t mt-auto h-full flex flex-col">
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              accept={supportedExtensions.map((ext) => `.${ext}`).join(',')}
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={() => setDraggedOver(false)}
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full h-fit flex-1"
              disabled={uploading}
            >
              <div className="flex flex-col justify-center items-center gap-4">
                {draggedOver ? (
                  <>
                    <Files
                      className={`transition-transform duration-500 ease-in-out transform ${draggedOver
                          ? 'scale-150 text-blue-400'
                          : 'scale-200 text-gray-500'
                        }`}
                    />
                    <div>Drop file Here</div>
                  </>
                ) : (
                  <>
                    <Upload
                      className={`transition-transform duration-500 ease-in-out transform ${draggedOver
                          ? 'scale-150 text-blue-500'
                          : 'scale-100 text-gray-500'
                        }`}
                    />
                    Upload
                  </>
                )}
              </div>
            </Button>

            <p className="my-6 text-sm text-center text-muted-foreground">
              Selected: {selectedFile ? selectedFile.name : 'None'}
            </p>
            {selectedFile ? (
              <Button
                className="my-2 w-full"
                disabled={uploading}
                onClick={(e) => handleUpload(e)}
              >
                Upload
              </Button>
            ) : null}
          </div>
        )}
      </Card>
    </>
  );
}

export default ActionsForm;
