import express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lab-orchestrator' });
});

app.listen(PORT, () => {
  console.log(`Lab Orchestrator running on port ${PORT}`);
});
