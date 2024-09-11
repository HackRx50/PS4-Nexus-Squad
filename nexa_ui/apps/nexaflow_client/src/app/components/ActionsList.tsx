import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@nexa_ui/shared";
import { Button } from "@nexa_ui/shared";
import { ScrollArea } from "@nexa_ui/shared";
import { Edit, Trash2 } from "lucide-react";


interface Action {
  code: string;
  created_at?: string;
  description: string;
  aid: string;
  language: string;
  title: string;
  updated_at?: string;
}

interface ActionsListProps{
    actions: Action[];
    // selectedActionIndex: number;    
    handleEditAction: (actionID: string) => void;
    handleDeleteAction: (actionID: string) => void;
}

const ActionsList: React.FC<ActionsListProps> = ({actions, handleEditAction, handleDeleteAction}) => {
  return (
    <Card className="w-1/3 mr-4 flex flex-col">
    <CardHeader className="flex flex-col space-y-1.5">
      <CardTitle className="text-2xl font-bold">Nexaflow</CardTitle>
      <p className="text-sm font-medium text-muted-foreground">
        Previous Actions
      </p>
    </CardHeader>
    <CardContent className="flex-grow overflow-hidden">
      <ScrollArea className="h-full">
        {actions.map((action) => (
          <Card key={action.aid} className="mb-4 relative group">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {action.title}
              </CardTitle>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditAction(action.aid)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
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
        ))}
      </ScrollArea>
    </CardContent>
  </Card>  )
}

export default ActionsList
