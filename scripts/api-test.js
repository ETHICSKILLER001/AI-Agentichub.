(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: 'You are helpful',
        history: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      }),
    });
    const data = await res.json();
    console.log('status', res.status);
    console.log('data', data);
  } catch (e) {
    console.error('err', e);
  }
})();
