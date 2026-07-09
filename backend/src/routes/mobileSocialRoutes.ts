import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { Post } from '../models/Post';
import { Story } from '../models/Story';
import { Reel } from '../models/Reel';
import { Profile } from '../models/Profile';
import { Notification } from '../models/Notification';
import { Report } from '../models/Report';
import { CallLog } from '../models/CallLog';

export const postRoutes = Router();
postRoutes.get('/', async (req, res) => {
  const q = String(req.query.q || '');
  const filter = q ? { $text: { $search: q } } : {};
  const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(Number(req.query.limit || 20));
  res.json({ posts });
});
postRoutes.post('/', auth, async (req: AuthRequest, res) => {
  const post = await Post.create({ ...req.body, user: req.userId });
  req.app.get('io')?.emit('post:new', post);
  res.status(201).json({ post });
});
postRoutes.post('/:id/like', auth, async (req: AuthRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const uid = String(req.userId);
  const liked = post.likes.map(String).includes(uid);
  await Post.findByIdAndUpdate(post.id, liked ? { $pull: { likes: req.userId } } : { $addToSet: { likes: req.userId } });
  res.json({ liked: !liked });
});

export const storyRoutes = Router();
storyRoutes.get('/', async (_req, res) => res.json({ stories: await Story.find({ expiresAt: { $gte: new Date() } }).sort({ createdAt: -1 }).limit(50) }));
storyRoutes.post('/', auth, async (req: AuthRequest, res) => res.status(201).json({ story: await Story.create({ ...req.body, user: req.userId }) }));

export const reelRoutes = Router();
reelRoutes.get('/', async (_req, res) => res.json({ reels: await Reel.find().sort({ views: -1, createdAt: -1 }).limit(30) }));
reelRoutes.post('/', auth, async (req: AuthRequest, res) => res.status(201).json({ reel: await Reel.create({ ...req.body, user: req.userId }) }));
reelRoutes.post('/:id/view', async (req, res) => {
  const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
  res.json({ reel });
});

export const profileRoutes = Router();
profileRoutes.get('/me', auth, async (req: AuthRequest, res) => res.json({ profile: await Profile.findOne({ user: req.userId }) }));
profileRoutes.put('/me', auth, async (req: AuthRequest, res) => {
  const profile = await Profile.findOneAndUpdate({ user: req.userId }, { $set: req.body }, { new: true, upsert: true });
  res.json({ profile });
});
profileRoutes.get('/search', async (req, res) => {
  const q = String(req.query.q || '');
  const filter = q ? { $text: { $search: q } } : {};
  res.json({ profiles: await Profile.find(filter).limit(20) });
});

export const notificationRoutes = Router();
notificationRoutes.get('/', auth, async (req: AuthRequest, res) => res.json({ notifications: await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50) }));
notificationRoutes.post('/', auth, async (req: AuthRequest, res) => {
  const notification = await Notification.create(req.body);
  req.app.get('io')?.to(String(req.body.user)).emit('notification:new', notification);
  res.status(201).json({ notification });
});

export const searchRoutes = Router();
searchRoutes.get('/', async (req, res) => {
  const q = String(req.query.q || '');
  const [posts, reels, profiles] = await Promise.all([
    Post.find(q ? { $text: { $search: q } } : {}).limit(10),
    Reel.find(q ? { $text: { $search: q } } : {}).limit(10),
    Profile.find(q ? { $text: { $search: q } } : {}).limit(10)
  ]);
  res.json({ q, posts, reels, profiles, suggestions: q ? [`${q} creators`, `${q} reels`, `${q} communities`] : ['gaming', 'music', 'anime'] });
});

export const reportRoutes = Router();
reportRoutes.post('/', auth, async (req: AuthRequest, res) => {
  const report = await Report.create({ ...req.body, reporter: req.userId, aiRiskScore: Math.round(Math.random() * 100) });
  res.status(201).json({ report });
});

export const callRoutes = Router();
callRoutes.get('/history', auth, async (req: AuthRequest, res) => res.json({ calls: await CallLog.find({ participants: req.userId }).sort({ createdAt: -1 }).limit(30) }));
callRoutes.post('/log', auth, async (req: AuthRequest, res) => res.status(201).json({ call: await CallLog.create({ ...req.body, participants: [req.userId, ...(req.body.participants || [])] }) }));

export const adminRoutes = Router();
adminRoutes.get('/analytics', async (_req, res) => {
  const [users, posts, stories, reels, reports] = await Promise.all([
    Profile.countDocuments(), Post.countDocuments(), Story.countDocuments(), Reel.countDocuments(), Report.countDocuments({ status: 'open' })
  ]);
  res.json({ users, posts, stories, reels, openReports: reports, revenue: 12680, activeUsers: 8549 });
});
