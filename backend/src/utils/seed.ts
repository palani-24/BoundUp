import 'dotenv/config';
import { connectDB } from '../config/database';
import { Anime } from '../models/Anime';
const data = [
  { title: 'Neon Samurai', category: 'Action', rating: 9.6, year: 2032, status: 'Trending', image: 'neon-samurai.svg', description: 'Cyber city ronin story', episodes: 24 },
  { title: 'Aura School', category: 'School', rating: 9.1, year: 2031, status: 'Popular', image: 'aura-school.svg', description: 'Mystic academy life', episodes: 18 }
];
async function run(){ await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boundup'); await Anime.deleteMany({}); await Anime.insertMany(data); console.log('Seed complete'); process.exit(0); }
run();
