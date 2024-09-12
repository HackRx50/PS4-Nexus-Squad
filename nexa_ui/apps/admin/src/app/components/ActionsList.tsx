import React, { ChangeEvent, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@nexa_ui/shared';
import { Button } from '@nexa_ui/shared';
import { ScrollArea } from '@nexa_ui/shared';
import { Edit, Trash2, Upload, Terminal } from 'lucide-react';

interface Action {
  code: string;
  created_at?: string;
  description: string;
  aid: string;
  language: string;
  title: string;
  updated_at?: string;
}

interface Document {
  doc_id: string;
  title: string;
  description: string;
  file_type: string;
  size: string;
  created_at?: string;
  updated_at?: string;
}

type ToggleOption = 'action' | 'documents';

interface ActionsListProps {
  actions: Action[];
  documentsData: Document[];
  selectedToggle: string;
  // selectedActionIndex: number;
  handleEditAction: (actionID: string) => void;
  handleDeleteAction: (actionID: string) => void;
  handleToggle: (option: ToggleOption) => void;
}


const ActionsList: React.FC<ActionsListProps> = ({
  actions,
  documentsData,
  handleEditAction,
  handleDeleteAction,
  handleToggle,
  selectedToggle
}) => {


  return (
    <Card className="w-1/3 mr-4 flex flex-col">
      <CardHeader className="flex flex-col space-y-1.5">
        <CardTitle className="text-2xl font-bold">Nexaflow: admin</CardTitle>
        {/* <p className="text-sm font-medium text-muted-foreground">
        Previous Actions
      </p> */}
        <div className="flex space-x-2 w-full">
          <Button
            variant={selectedToggle === 'action' ? 'secondary' : 'outline'}
            onClick={() => handleToggle('action')}
            className="w-[50%]"
          >
            <Terminal className="w-4 mr-2"  />
            Action
          </Button>
          <Button 
            variant={selectedToggle === 'documents' ? 'secondary' : 'outline'}
            onClick={() => handleToggle('documents')}
            className="w-[50%]"
          >
            <Upload className="w-4 mr-2" />
            Documents
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">

          {selectedToggle === "action" ? actions.map((action) => (
            <Card key={action.aid} className="mb-4 relative group">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {action.title}
                </CardTitle>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className='hidden'
                    onClick={() => handleEditAction(action.aid)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    className="scale-[.85]"
                    size="icon"
                    onClick={() => handleDeleteAction(action.aid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{action.language}</span>
                  <span>{action.created_at}</span>
                </div>
              </CardContent>
            </Card>
          )) : documentsData.map((document) => (
            <Card key={document.doc_id} className="mb-4 relative group">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {document.title}
                </CardTitle>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    className='hidden'
                    size="icon"
                    onClick={() => handleEditAction(document.doc_id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="scale-[.85]"
                    onClick={() => handleDeleteAction(document.doc_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="w-1/2">{document.description}</span>
                  <span className="mt-auto">{document.created_at}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActionsList;
