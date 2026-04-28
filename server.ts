import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory OTP storage (for development/demo)
  const otpStore = new Map<string, { otp: string, expires: number }>();

  // WhatsApp API integration
  app.post('/api/send-otp', async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
      return res.status(400).json({ error: 'Contact number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(contact, { otp, expires });

    const licenseNumber = '41863602642';
    const apiKey = 'IPK2N0tlRno3CyrOxZfd7pX8F';
    const apiUrl = `https://whatsapp.gntindia.com/api/sendtemplate.php?LicenseNumber=${licenseNumber}&APIKey=${apiKey}&Contact=${contact}&Template=otp_verify&Param=${otp}&URLParam=${otp}&Name=NA`;

    try {
      await axios.get(apiUrl);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      console.error('WhatsApp API Error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  app.post('/api/verify-otp', async (req, res) => {
    const { contact, otp } = req.body;
    const stored = otpStore.get(contact);

    if (!stored) {
      return res.status(400).json({ error: 'No OTP sent for this number' });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(contact);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (stored.otp === otp) {
      otpStore.delete(contact);
      // In a real app, generate a JWT or use Firebase Custom Token
      res.json({ success: true, message: 'OTP verified' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  });

  // MOCK: Google Sheet Sync Endpoint
  app.post('/api/sync-rates', async (req, res) => {
    // This is where you would fetch from a public CSV:
    // const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv';
    // const response = await axios.get(SHEET_URL);
    // Then parse CSV and update Firestore via Firebase Admin (if available) 
    // or just return data for the client to update.

    console.log('Syncing rates from Sheet...');
    res.json({ 
      success: true, 
      message: 'Rates synchronized with Google Sheet successfully (Simulation)',
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
