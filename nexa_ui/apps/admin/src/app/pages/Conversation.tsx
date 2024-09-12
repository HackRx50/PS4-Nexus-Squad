import { useState, KeyboardEvent, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from "@nexa_ui/shared"
import { Textarea } from "@nexa_ui/shared"
import { Input } from "@nexa_ui/shared"
import { Card } from "@nexa_ui/shared"
import { ArrowRight, Upload, Loader2 } from "lucide-react";
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  content: string;
  isUser: boolean;
}

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [llmResponseLoading, setLLMResponseLoading] = useState(false);
  
  const { agent_id } = useParams<{ agent_id: string }>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function bootAgent(agent_id: string) {
    const response = await fetch(`/api/v1/nexbot/boot_agent/${agent_id}`);
    const data = await response.json();
    console.log(data);
  }

  useEffect(() => {
    bootAgent(agent_id || "default_agent");
  }, []);

  useEffect(scrollToBottom, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 40 * 10);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > newHeight ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  const handleSendMessage = async () => {
    if (inputText.trim()) {
      setInputText('');
      setLLMResponseLoading(true);

      try {
        const userMessage = { query: inputText };
        const response = await fetch(`/api/v1/nexbot/conversation/${agent_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userMessage),
        });
        const data = await response.json();
        console.log(data);
        setMessages(prevMessages => [...prevMessages, ...data.messages]);
      } catch (error) {
        console.error("Error fetching LLM response:", error);
        setMessages(prevMessages => [...prevMessages, { isUser: false, content: "Sorry, there was an error processing your request." }]);
      } finally {
        setLLMResponseLoading(false);
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
    // TODO: Handle file upload logic here
    console.log("File selected:", file?.name);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card className="w-64 border-r hidden md:flex md:flex-col">
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          {/* Add more sidebar elements as needed */}
        </div>
        <div className="p-4 border-t">
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          {selectedFile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </Card>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-2 rounded-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} break-words`}>
                {message.isUser ? (
                  message.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <pre className={`p-2 bg-gray-800 rounded ${className} overflow-x-auto`}>
                            <code className={`language-${match[1]}`} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {llmResponseLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-2 rounded-lg bg-muted flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>
        <Card className="border-t p-4">
          <div className="flex items-end space-x-2">
            <Textarea 
              ref={textareaRef}
              className="resize-none min-h-[40px] max-h-[400px]"
              placeholder="Type your message here." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ChatPanel;
