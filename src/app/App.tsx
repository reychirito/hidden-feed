import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPosts } from './data/mockPosts';
import { Post, UserInteraction, Lean } from './types/post';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FeedCard } from './components/FeedCard';
import { RevealScreen } from './components/RevealScreen';

type Screen = 'welcome' | 'feed' | 'reveal';

const MAX_INTERACTIONS = 15;

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [feedQueue, setFeedQueue] = useState<Post[]>([]);
  const [shownPostIds, setShownPostIds] = useState<Set<string>>(new Set());
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBubbleWarning, setShowBubbleWarning] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Calculate user preference from interactions
  const getUserLeanScores = useCallback(() => {
    const scores: Record<Lean, number> = { left: 0, right: 0, center: 0 };
    interactions.forEach(int => {
      const weight = int.type === 'share' ? 3 : int.type === 'comment' ? 2 : 1;
      scores[int.lean as Lean] = (scores[int.lean as Lean] || 0) + weight;
    });
    return scores;
  }, [interactions]);

  const dominantLean = useMemo((): Lean => {
    const scores = getUserLeanScores();
    if (scores.left === scores.right && scores.left === scores.center) return 'center';
    return scores.left >= scores.right && scores.left >= scores.center
      ? 'left'
      : scores.right >= scores.left && scores.right >= scores.center
      ? 'right'
      : 'center';
  }, [getUserLeanScores]);

  const algorithmStrength = useMemo(() => {
    return Math.min(interactions.length / MAX_INTERACTIONS, 1);
  }, [interactions.length]);

  // Build initial feed
  useEffect(() => {
    if (screen === 'feed' && feedQueue.length === 0) {
      // Start with a broad mix: first 8 posts from the pool
      const initial = mockPosts.slice(0, 8);
      setFeedQueue(initial);
      setShownPostIds(new Set(initial.map(p => p.id)));
    }
  }, [screen, feedQueue.length]);

  // Algorithm: get next posts to add based on preferences
  const getNextPosts = useCallback((count: number) => {
    const scores = getUserLeanScores();
    const totalScore = scores.left + scores.right + scores.center;
    if (totalScore === 0) return [];

    const remaining = mockPosts.filter(p => !shownPostIds.has(p.id) && !hiddenPostIds.has(p.id));
    if (remaining.length === 0) return [];

    // Score each remaining post
    const strength = algorithmStrength;
    const scored = remaining.map(post => {
      const leanMatch = scores[post.lean] / Math.max(totalScore, 1);
      // Random component decreases as algorithm strengthens
      const randomness = (1 - strength) * Math.random();
      const algorithmScore = strength * leanMatch * 3;
      return { post, score: algorithmScore + randomness };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map(s => s.post);
  }, [getUserLeanScores, shownPostIds, hiddenPostIds, algorithmStrength]);

  // Track hidden posts (ones the algorithm would suppress)
  useEffect(() => {
    if (interactions.length < 4) return;
    const scores = getUserLeanScores();
    const totalScore = scores.left + scores.right + scores.center;
    if (totalScore === 0) return;

    const dominant = dominantLean;
    const oppositeLean: Lean = dominant === 'left' ? 'right' : dominant === 'right' ? 'left' : 'center';

    const newHidden = new Set(hiddenPostIds);
    mockPosts.forEach(post => {
      if (!shownPostIds.has(post.id) && !newHidden.has(post.id)) {
        // The algorithm hides opposite-leaning posts more aggressively over time
        if (post.lean === oppositeLean && Math.random() < algorithmStrength * 0.7) {
          newHidden.add(post.id);
        }
      }
    });

    if (newHidden.size !== hiddenPostIds.size) {
      setHiddenPostIds(newHidden);
    }
  }, [interactions.length]);

  const addMorePosts = useCallback(() => {
    const next = getNextPosts(2);
    if (next.length > 0) {
      setFeedQueue(prev => [...prev, ...next]);
      setShownPostIds(prev => {
        const newSet = new Set(prev);
        next.forEach(p => newSet.add(p.id));
        return newSet;
      });
    }
  }, [getNextPosts]);

  const recordInteraction = useCallback((postId: string, type: 'like' | 'comment' | 'share') => {
    const post = mockPosts.find(p => p.id === postId);
    if (!post) return;

    setInteractions(prev => {
      const newInteractions = [...prev, { postId, type, topic: post.topic, lean: post.lean }];

      // Show bubble warning at certain thresholds
      if (newInteractions.length === 6 || newInteractions.length === 10) {
        setShowBubbleWarning(true);
        setTimeout(() => setShowBubbleWarning(false), 3000);
      }

      // Trigger reveal
      if (newInteractions.length >= MAX_INTERACTIONS) {
        setTimeout(() => setScreen('reveal'), 1500);
      }

      return newInteractions;
    });

    // Add more posts after engagement
    setTimeout(addMorePosts, 200);
  }, [addMorePosts]);

  const handleLike = useCallback((postId: string) => {
    const isLiked = likedPosts.has(postId);
    if (isLiked) {
      setLikedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
    } else {
      setLikedPosts(prev => new Set([...prev, postId]));
      recordInteraction(postId, 'like');
    }
  }, [likedPosts, recordInteraction]);

  const handleComment = useCallback((postId: string) => {
    recordInteraction(postId, 'comment');
  }, [recordInteraction]);

  const handleShare = useCallback((postId: string) => {
    recordInteraction(postId, 'share');
  }, [recordInteraction]);

  const handleRestart = () => {
    setScreen('welcome');
    setInteractions([]);
    setLikedPosts(new Set());
    setFeedQueue([]);
    setShownPostIds(new Set());
    setHiddenPostIds(new Set());
    setCurrentIndex(0);
  };

  // Scroll handler for snap detection
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const el = feedRef.current;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setCurrentIndex(idx);

    // Load more when near end
    if (idx >= feedQueue.length - 3) {
      addMorePosts();
    }
  }, [feedQueue.length, addMorePosts]);

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={() => setScreen('feed')} />;
  }

  if (screen === 'reveal') {
    return (
      <RevealScreen
        allPosts={mockPosts}
        shownPostIds={shownPostIds}
        hiddenPostIds={hiddenPostIds}
        interactions={interactions}
        onRestart={handleRestart}
        dominantLean={dominantLean}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden">
      {/* Phone frame container */}
      <div className="h-full w-full max-w-md mx-auto relative">
        {/* TikTok-style vertical snap scroll feed */}
        <div
          ref={feedRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {feedQueue.map((post) => (
            <div key={post.id} className="h-full w-full snap-start snap-always" style={{ minHeight: '100vh' }}>
              <FeedCard
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                isLiked={likedPosts.has(post.id)}
                interactionCount={interactions.length}
                algorithmStrength={algorithmStrength}
              />
            </div>
          ))}
        </div>

        {/* Top overlay - status bar style */}
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
          <div className="flex items-center justify-center pt-12 pb-3">
            <div className="flex gap-6">
              <span className="text-white/50 text-sm">Following</span>
              <span className="text-white text-sm border-b-2 border-white pb-1">For You</span>
            </div>
          </div>
        </div>

        {/* Bottom nav bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center justify-around py-2 pb-5">
            {['Home', 'Discover', '+', 'Inbox', 'Profile'].map((item) => (
              <button key={item} className="flex flex-col items-center gap-0.5 px-3 py-1">
                {item === '+' ? (
                  <div className="w-10 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-red-500 flex items-center justify-center">
                    <span className="text-white text-lg leading-none">+</span>
                  </div>
                ) : (
                  <>
                    <div className={`w-5 h-5 rounded-sm ${item === 'Home' ? 'bg-white' : 'bg-white/30'}`} />
                    <span className={`text-xs ${item === 'Home' ? 'text-white' : 'text-white/40'}`}>{item}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Interaction counter (subtle) */}
        {interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-14 left-4 z-30"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
                  <circle
                    cx="10" cy="10" r="8" fill="none" stroke="url(#grad)" strokeWidth="2"
                    strokeDasharray={`${(interactions.length / MAX_INTERACTIONS) * 50.26} 50.26`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-white/70 text-xs">{interactions.length}/{MAX_INTERACTIONS}</span>
            </div>
          </motion.div>
        )}

        {/* Bubble warning overlay */}
        <AnimatePresence>
          {showBubbleWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-28 left-4 right-4 z-40"
            >
              <div className="bg-purple-600/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-start gap-3">
                <span className="text-lg">🫧</span>
                <div>
                  <p className="text-white text-sm">
                    {interactions.length <= 7
                      ? 'Notice anything? Your feed is starting to shift...'
                      : 'Your bubble is forming. Content is becoming more one-sided.'}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    {Math.round(algorithmStrength * 100)}% algorithm influence
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe hint on first card */}
        {currentIndex === 0 && interactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 left-0 right-0 z-30 flex justify-center pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/60 text-xs"
            >
              Swipe up for more
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
