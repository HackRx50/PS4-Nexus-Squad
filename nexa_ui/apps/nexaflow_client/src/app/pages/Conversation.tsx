import { useState, KeyboardEvent, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from '@nexa_ui/shared';
import { Textarea } from '@nexa_ui/shared';
import { Input } from '@nexa_ui/shared';
import { Card } from '@nexa_ui/shared';
import { ArrowRight, Upload, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import { Message } from '../types';

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [llmResponseLoading, setLLMResponseLoading] = useState(false);
  const [convoID, setConvoID] = useState<string | undefined>('');

  const { session_id } = useParams<{ session_id: string }>();
  const location = useLocation();

  useEffect(() => {
    const url = location.pathname;
    setConvoID(url.split('/').pop());
  }, []);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/v1/chat/${session_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '075823263cf07d51a7d82c8fbb90c92d',
        },
      });
      const sessionData: { messages: Message[] } = await response.json();
      console.log('sessionData', sessionData);
      setMessages(
        sessionData['messages'].filter(
          (message) => message.content && message.type !== 'tool'
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 40 * 10);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY =
        textarea.scrollHeight > newHeight ? 'auto' : 'hidden';
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
        setMessages((prev) => [
          ...prev,
          {
            type: 'human',
            id: '',
            additional_kwargs: {},
            content: userMessage.query,
            example: true,
            name: 'fas',
            response_metadata: {},
          },
        ]);
        const response = await fetch(`/api/v1/chat/${session_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': '075823263cf07d51a7d82c8fbb90c92d',
          },
          body: JSON.stringify(userMessage),
        });
        if (response.ok) {
          const data: Message[] = await response.json();
          console.log(data);
          setMessages((prevMessages) => [
            ...prevMessages,
            ...data
              .slice(1)
              .filter((message) => message.content && message.type !== 'tool'),
          ]);
        } else {
          console.log(await response.text());
        }
      } catch (error) {
        console.error('Error fetching LLM response:', error);
      } finally {
        setLLMResponseLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card className="w-96 border-r hidden md:flex md:flex-col">
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold">Nexaflow</h2>
          {/* Add more sidebar elements as needed */}
        </div>
      </Card>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "human" ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  message.type === 'human'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } break-words`}
              >
                {message.type === 'human' ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre
                            className={`p-2 bg-gray-800 rounded ${className} overflow-x-auto`}
                          >
                            <code className={`language-${match[1]}`} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
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
        </div>
        <div className="border-t p-4 border-r-0">
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
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
