
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const apiKey = 'UQFhR39JqfdjbecSUgPPMOAfZZvjGddG';
const externalUserId = '66e401af8e164a434b8c7083';

let sessionId = null;

async function createChatSession() {
  try {
    const response = await axios.post(
      'https://api.on-demand.io/chat/v1/sessions',
      {
        pluginIds: [],
        externalUserId: externalUserId
      },
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data.data.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

async function submitQuery(query) {
  if (!sessionId) {
    sessionId = await createChatSession();
  }

  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: query,
        pluginIds: ['plugin-1717418212'],
        responseMode: 'sync'
      },
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data.data.response;
  } catch (error) {
    console.error('Error submitting query:', error);
    throw error;
  }
}

app.post('/chat', async (req, res) => {
  try {
    const query = req.body.message;
    const response = await submitQuery(query);
    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
