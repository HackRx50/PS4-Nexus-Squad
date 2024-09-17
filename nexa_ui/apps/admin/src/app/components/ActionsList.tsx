import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  formatDate,
  Input,
  useToast,
} from '@nexa_ui/shared';
import { Button } from '@nexa_ui/shared';
import { ScrollArea } from '@nexa_ui/shared';
import { Edit, Trash2, Upload, Terminal } from 'lucide-react';
import { Action, DocumentMetaData } from '../types';
import { useParams } from 'react-router-dom';
import { BASE_URL, appFetch, getActions, getDocuments } from '../utility';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addActions, addDocumentMetaData } from '../store';

type ToggleOption = 'action' | 'documents';

interface ActionsListProps {
  selectedToggle: string;
  handleDeleteAction: (actionID: string) => void;
  handleToggle: (option: ToggleOption) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({
  handleDeleteAction,
  handleToggle,
  selectedToggle,
}) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { agent_name } = useParams();

  const user = useAppSelector((state) => state.userReducer.user);
  const actionsMap = useAppSelector((state) => state.actionsSlice.actions);
  const documentsMap = useAppSelector(
    (state) => state.documentsSlice.documentMetaData
  );

  const [documents, setDocuments] = useState<DocumentMetaData[]>([]);
  const [actions, setActions] = useState<Action[]>([]);


  useEffect(() => {
    if (agent_name && actionsMap[agent_name]) {
      setActions(actionsMap[agent_name]);
    }
  }, [agent_name, actionsMap]);

  useEffect(() => {
    if (agent_name && documentsMap[agent_name]) {
      setDocuments(documentsMap[agent_name]);
    }
  }, [agent_name, documentsMap]);


  useEffect(() => {
    if (agent_name && user) {
      getActions(agent_name!).then((actions) =>
        dispatch(addActions({ agent_name: agent_name!, actions }))
      );
      getDocuments(agent_name!).then((documents) =>
        dispatch(addDocumentMetaData({ agent_name: agent_name!, documents }))
      );
    }
  }, [agent_name, user]);


  async function handleDeleteDocument(did: string) {
    try {
      const response = await appFetch(BASE_URL`/api/v1/documents/${did}`, {
        agent_name,
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await response.json();
        const newDocumets = documents.filter(
          (action) => action.did !== data.document_id
        );
        dispatch(
          addDocumentMetaData({
            agent_name: agent_name!,
            documents: newDocumets,
          })
        );

        toast({
          title: data.message,
          description: `The document with ${data.document_id} has been successfully deleted.`,
          duration: 3000,
        });
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  }

  return (
    <Card className="w-1/3 mr-4 flex flex-col">
      <CardHeader className="flex flex-col space-y-1.5">
        <CardTitle className="text-2xl font-bold pb-4">
          Nexaflow: admin
        </CardTitle>
        {/* <p className="text-sm font-medium text-muted-foreground">
        Previous Actions
      </p> */}
        <div className="flex space-x-2 w-full">
          <Button
            variant={selectedToggle === 'action' ? 'secondary' : 'outline'}
            onClick={() => handleToggle('action')}
            className="w-[50%]"
          >
            <Terminal className="w-4 mr-2" />
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
          {selectedToggle === 'action'
            ? actions.map((action) => (
                <Card key={action.aid} className="mb-4 relative group">
                  <CardHeader className="py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium break-all">
                      {action.title}
                    </CardTitle>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="hidden">
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
                      <span>{formatDate(action.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            : documents.map((document) => (
                <Card key={document.did} className="mb-4 relative group">
                  <CardHeader className="py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium break-all">
                      {document.name}
                    </CardTitle>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" className="hidden" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="scale-[.85]"
                        onClick={() => handleDeleteDocument(document.did)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex justify-end text-xs text-muted-foreground">
                      <span className="mt-auto">{formatDate(document.created_at)}</span>
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
