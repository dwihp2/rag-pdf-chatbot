// Test script to verify the chat API is working correctly
const testChatAPI = async () => {
  try {
    console.log('Testing chat API...');
    
    // First, create a new chat
    console.log('Creating new chat...');
    const createChatResponse = await fetch('http://localhost:3001/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Chat'
      }),
    });

    if (!createChatResponse.ok) {
      const errorText = await createChatResponse.text();
      console.error('Create Chat Error:', errorText);
      return;
    }

    const chatData = await createChatResponse.json();
    console.log('Chat created:', chatData);
    const chatId = chatData.chat.id;
    
    // Now test the chat API with a valid chat ID
    console.log('Testing chat API with valid chat ID...');
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, this is a test message' }],
        chatId: chatId
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    // Since it's a streaming response, we need to read the stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        console.log('Stream chunk:', chunk);
      }
    }

    console.log('Full response:', fullResponse);
    console.log('✅ API test completed successfully');

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

testChatAPI();
