import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const contentFilePath = path.join(process.cwd(), 'content.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(contentFilePath, 'utf8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read content data' });
    }
  } else if (req.method === 'POST') {
    try {
      const newContent = req.body;
      fs.writeFileSync(contentFilePath, JSON.stringify(newContent, null, 2), 'utf8');
      res.status(200).json({ message: 'Content updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save content data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
