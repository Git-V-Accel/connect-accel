import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Send, Search, Paperclip } from 'lucide-react';
import { toast } from '../../utils/toast';

export default function MessagesPage() {
  const { user } = useAuth();
  const { getUserConversations, getConversation, sendMessage, markMessageAsRead } = useData();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const conversations = getUserConversations(user.id);
  const filteredConversations = conversations.filter(c =>
    c.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const messages = selectedConversation ? getConversation(selectedConversation) : [];

  const handleSendMessage = () => {
    if (!selectedConversation || !messageText.trim()) return;

    sendMessage({
      conversation_id: selectedConversation,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      content: messageText,
    });

    setMessageText('');
    toast.success('Message sent');
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversation(convId);
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      const unreadMessages = getConversation(convId).filter(m => !m.read && m.sender_id !== user.id);
      unreadMessages.forEach(m => markMessageAsRead(m.id));
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)]">
        <Card className="h-full flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map(conv => {
                const otherParticipants = conv.participants.filter(p => p.id !== user.id);
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {otherParticipants[0]?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">
                            {otherParticipants.map(p => p.name).join(', ')}
                          </p>
                          {conv.unread_count > 0 && (
                            <Badge variant="default" className="ml-2">{conv.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        {conv.last_message_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConv.participants.find(p => p.id !== user.id)?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedConv.participants.filter(p => p.id !== user.id).map(p => p.name).join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedConv.participants.filter(p => p.id !== user.id).map(p => p.role).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => {
                    const isOwn = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-600 mb-1 ml-3">{message.sender_name}</p>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'} mx-3`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center text-gray-600 py-12">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="size-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a conversation to start messaging</p>
                  <p className="text-sm">Choose from the list on the left</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
