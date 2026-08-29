import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OmniRoute is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`OmniRoute server is listening on port ${PORT}`);
});
