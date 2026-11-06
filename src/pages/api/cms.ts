import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const contentFilePath = path.join(process.cwd(), 'content.json');
const defaultContent = {
  hero: {
    title: 'Precision Agriculture',
    description: 'Smarter tools for healthier fields, efficient operations, and confident decisions.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85',
  },
  vision: {
    title: 'Better decisions start in the field',
    description: 'We bring field data, crop insights, and practical automation together to help farms work with greater precision.',
    imageUrl: '',
  },
  products: {
    title: 'Tools for modern farms',
    description: 'A connected rover platform for crop monitoring and precision field operations.',
    imageUrl: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1400&q=85',
  },
  technology: {
    title: 'Technology built for real fields',
    description: 'On-device analytics and connected tools help turn field observations into timely action.',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85',
  },
  applications: {
    title: 'From monitoring to action',
    description: 'Support crop monitoring, field operations, and more precise application workflows.',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85',
  },
  founders: {
    title: 'Agriculture and engineering, working together',
    description: 'A team focused on practical robotics and data tools for agriculture.',
    imageUrl: '',
  },
  contact: {
    title: 'Let’s grow smarter together',
    description: 'Contact our team to learn more about the AgriRover platform.',
    imageUrl: '',
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(contentFilePath, 'utf8');
      const savedContent = JSON.parse(data);
      const content = Object.fromEntries(
        Object.entries(defaultContent).map(([section, defaults]) => [
          section,
          { ...defaults, ...(savedContent[section] || {}) },
        ]),
      );
      res.status(200).json(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to read CMS content; using defaults.', error);
      }
      res.status(200).json(defaultContent);
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
