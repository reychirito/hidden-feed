import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Music, Bookmark } from 'lucide-react';
import { Post } from '../types/post';

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

interface FeedCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  isLiked: boolean;
  interactionCount: number;
  algorithmStrength: number; // 0-1 how filtered the feed is
}

export function FeedCard({
  post,
  onLike,
  onComment,
  onShare,
  isLiked,
  interactionCount,
  algorithmStrength,
}: FeedCardProps) {
  const [showComment, setShowComment] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleComment = () => {
    setShowComment(true);
    onComment(post.id);
    setTimeout(() => setShowComment(false), 2000);
  };

  const handleShare = () => {
    setShowShareToast(true);
    onShare(post.id);
    setTimeout(() => setShowShareToast(false), 1500);
  };

  // Lean color indicator (subtle)
  const leanColor =
    post.lean === 'left'
      ? 'from-blue-600/40'
      : post.lean === 'right'
      ? 'from-red-600/40'
      : 'from-gray-600/40';

  return (
    <div className="h-full w-full relative snap-start snap-always flex-shrink-0">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={post.image}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
        <div className={`absolute inset-0 bg-gradient-to-tr ${leanColor} to-transparent opacity-30`} />
      </div>

      {/* Algorithm strength indicator - subtle top bar */}
      {algorithmStrength > 0.1 && (
        <div className="absolute top-0 left-0 right-0 z-20">
          <div
            className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${algorithmStrength * 100}%` }}
          />
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end z-10 pb-20 px-4">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
          />
          <div>
            <p className="text-white text-sm">{post.author}</p>
            <p className="text-white/50 text-xs">{post.handle}</p>
          </div>
          {interactionCount > 4 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 backdrop-blur-sm">
              For You
            </span>
          )}
        </div>

        {/* Post content */}
        <p className="text-white text-sm leading-relaxed mb-3 max-w-[85%]">
          {post.content}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-white/70 text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* Sound label */}
        {post.soundLabel && (
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-3 h-3 text-white/50" />
            <p className="text-white/50 text-xs">{post.soundLabel}</p>
          </div>
        )}
      </div>

      {/* Right side action buttons (TikTok style) */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={() => onLike(post.id)}
          className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-8 h-8 ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-white'
              }`}
            />
          </motion.div>
          <span className="text-white text-xs">
            {formatCount(post.likes + (isLiked ? 1 : 0))}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={handleComment}
          className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
        >
          <MessageCircle className="w-8 h-8 text-white" />
          <span className="text-white text-xs">{formatCount(post.comments)}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
        >
          <Share2 className="w-8 h-8 text-white" />
          <span className="text-white text-xs">{formatCount(post.shares)}</span>
        </button>

        {/* Bookmark */}
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="w-7 h-7 text-white" />
        </button>

        {/* Spinning avatar disc */}
        <motion.div
          className="w-10 h-10 rounded-lg border-2 border-white/30 overflow-hidden mt-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <img
            src={post.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Comment toast */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-24 left-4 right-16 z-30 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3"
          >
            <p className="text-white/80 text-xs">Comment recorded as engagement</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 text-center"
          >
            <Share2 className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white text-sm">Shared!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
