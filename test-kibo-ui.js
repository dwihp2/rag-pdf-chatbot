// Test the updated chat interface
const testChatWithKiboUI = async () => {
  try {
    console.log('Testing chat with Kibo UI components...');
    
    // Create a new chat
    const createChatResponse = await fetch('http://localhost:3001/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Chat with Kibo UI'
      }),
    });

    const chatData = await createChatResponse.json();
    console.log('Chat created:', chatData);
    const chatId = chatData.chat.id;
    
    // Test the chat API
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, this is a test with markdown formatting. Can you provide a **bold** response with a list?' }],
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

    // Read the streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        
        // Show first few chunks for debugging
        if (fullResponse.length < 500) {
          console.log('Stream chunk:', chunk);
        }
      }
    }

    console.log('✅ Chat API test with Kibo UI completed successfully');
    console.log('Response length:', fullResponse.length);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testChatWithKiboUI();
