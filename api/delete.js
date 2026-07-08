const https = require('https');
const crypto = require('crypto');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ error: 'Missing publicId' });

  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = 'fn6bhpgq';

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = `public_id=${encodeURIComponent(publicId)}&timestamp=${timestamp}&api_key=${apiKey}&signature=${signature}`;

  const options = {
    hostname: 'api.cloudinary.com',
    path: `/v1_1/${cloudName}/image/destroy`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formData),
    },
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.status(200).json(parsed);
      } catch {
        res.status(500).json({ error: 'Invalid response from Cloudinary' });
      }
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  request.write(formData);
  request.end();
}