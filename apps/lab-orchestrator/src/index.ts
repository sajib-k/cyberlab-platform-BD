import express from 'express';

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cyberlab-lab-orchestrator',
  });
});

app.listen(PORT, () => {
  console.log(`Lab Orchestrator running on http://localhost:${PORT}`);
});
