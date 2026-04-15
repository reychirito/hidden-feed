import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, BarChart3, ArrowRight, RotateCcw, ChevronDown, AlertTriangle, TrendingUp } from 'lucide-react';
import { Post, UserInteraction, Lean } from '../types/post';

interface RevealScreenProps {
  allPosts: Post[];
  shownPostIds: Set<string>;
  hiddenPostIds: Set<string>;
  interactions: UserInteraction[];
  onRestart: () => void;
  dominantLean: Lean;
}

function getLeanLabel(lean: Lean) {
  return lean === 'left' ? 'Left-Leaning' : lean === 'right' ? 'Right-Leaning' : 'Centrist';
}

function getLeanColor(lean: Lean) {
  return lean === 'left' ? 'text-blue-400' : lean === 'right' ? 'text-red-400' : 'text-gray-400';
}

function getLeanBg(lean: Lean) {
  return lean === 'left' ? 'bg-blue-500' : lean === 'right' ? 'bg-red-500' : 'bg-gray-500';
}

export function RevealScreen({ allPosts, shownPostIds, hiddenPostIds, interactions, onRestart, dominantLean }: RevealScreenProps) {
  const [tab, setTab] = useState<'overview' | 'hidden' | 'shown'>('overview');

  const shownPosts = allPosts.filter(p => shownPostIds.has(p.id));
  const hiddenPosts = allPosts.filter(p => hiddenPostIds.has(p.id));

  // Calculate stats
  const leanCounts = { left: 0, right: 0, center: 0 };
  const shownLeanCounts = { left: 0, right: 0, center: 0 };
  const hiddenLeanCounts = { left: 0, right: 0, center: 0 };

  allPosts.forEach(p => { leanCounts[p.lean]++; });
  shownPosts.forEach(p => { shownLeanCounts[p.lean]++; });
  hiddenPosts.forEach(p => { hiddenLeanCounts[p.lean]++; });

  const totalShown = shownPosts.length;
  const totalHidden = hiddenPosts.length;
  const oppositeLabel = dominantLean === 'left' ? 'Right-Leaning' : dominantLean === 'right' ? 'Left-Leaning' : 'Opposing';
  const oppositeLean: Lean = dominantLean === 'left' ? 'right' : dominantLean === 'right' ? 'left' : 'center';
  const oppositeHiddenPct = totalHidden > 0 ? Math.round((hiddenLeanCounts[oppositeLean] / totalHidden) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-5 pt-14 pb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5"
        >
          <Eye className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-2xl mb-2"
        >
          Your Bubble Revealed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-400 text-sm max-w-xs mx-auto"
        >
          After {interactions.length} interactions, here's what the algorithm did to your feed.
        </motion.p>
      </motion.div>

      {/* Key stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="px-5 grid grid-cols-2 gap-3 mb-6"
      >
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <Eye className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl text-white">{totalShown}</p>
          <p className="text-gray-500 text-xs">Posts Shown</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <EyeOff className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl text-white">{totalHidden}</p>
          <p className="text-gray-500 text-xs">Posts Hidden</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <TrendingUp className="w-5 h-5 text-purple-400 mb-2" />
          <p className={`text-2xl ${getLeanColor(dominantLean)}`}>{getLeanLabel(dominantLean)}</p>
          <p className="text-gray-500 text-xs">Your Detected Lean</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl text-amber-400">{oppositeHiddenPct}%</p>
          <p className="text-gray-500 text-xs">{oppositeLabel} Hidden</p>
        </div>
      </motion.div>

      {/* Visual bar comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="px-5 mb-6"
      >
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Feed Composition</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">What You Saw</span>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex bg-white/5">
              {totalShown > 0 && (
                <>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(shownLeanCounts.left / totalShown) * 100}%` }}
                    transition={{ delay: 1.3, duration: 0.8 }}
                    className="bg-blue-500 h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(shownLeanCounts.center / totalShown) * 100}%` }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="bg-gray-500 h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(shownLeanCounts.right / totalShown) * 100}%` }}
                    transition={{ delay: 1.7, duration: 0.8 }}
                    className="bg-red-500 h-full"
                  />
                </>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">What Was Hidden</span>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex bg-white/5">
              {totalHidden > 0 && (
                <>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(hiddenLeanCounts.left / totalHidden) * 100}%` }}
                    transition={{ delay: 1.9, duration: 0.8 }}
                    className="bg-blue-500/60 h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(hiddenLeanCounts.center / totalHidden) * 100}%` }}
                    transition={{ delay: 2.1, duration: 0.8 }}
                    className="bg-gray-500/60 h-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(hiddenLeanCounts.right / totalHidden) * 100}%` }}
                    transition={{ delay: 2.3, duration: 0.8 }}
                    className="bg-red-500/60 h-full"
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Left</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> Center</span>
            <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Right</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-white/5 rounded-xl p-1">
          {(['overview', 'shown', 'hidden'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs capitalize transition-all ${
                tab === t ? 'bg-white/10 text-white' : 'text-gray-500'
              }`}
            >
              {t === 'overview' ? '💡 Insights' : t === 'shown' ? `👁 Shown (${totalShown})` : `🚫 Hidden (${totalHidden})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 pb-32">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
                <h3 className="text-white mb-2">🫧 How Your Bubble Formed</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every like, comment, and share told the algorithm what you prefer. Within just {interactions.length} interactions,
                  it started {dominantLean !== 'center' ? `prioritizing ${getLeanLabel(dominantLean).toLowerCase()} content and suppressing ${oppositeLabel.toLowerCase()} viewpoints` : 'filtering based on your topic preferences'}.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white mb-2">⚠️ In Real Social Media</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Real platforms process <span className="text-white">thousands</span> of signals — not just likes. Watch time, scroll speed, even hesitation
                  all feed the algorithm. This demo uses a simplified version, but the effect is the same: your world view narrows without you noticing.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white mb-2">🧠 Why It Matters</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Filter bubbles don't just hide content — they change how you perceive reality. When you only see one side,
                  the other side seems extreme, irrational, or even dangerous. This is how polarization accelerates.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white mb-2">🛡️ How to Fight Back</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Actively seek out perspectives you disagree with</li>
                  <li>• Use multiple news sources across the political spectrum</li>
                  <li>• Be aware that your feed is curated, not neutral</li>
                  <li>• Engage critically with emotionally charged content</li>
                </ul>
              </div>
            </motion.div>
          )}

          {tab === 'shown' && (
            <motion.div
              key="shown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {shownPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3"
                >
                  <img src={post.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs">{post.author}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getLeanBg(post.lean)}/20 ${getLeanColor(post.lean)}`}>
                        {getLeanLabel(post.lean)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{post.content}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === 'hidden' && (
            <motion.div
              key="hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {hiddenPosts.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No posts were hidden. Try engaging more to see the algorithm in action!
                </div>
              ) : (
                hiddenPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-3"
                  >
                    <img src={post.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 opacity-60" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-xs">{post.author}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getLeanBg(post.lean)}/20 ${getLeanColor(post.lean)}`}>
                          {getLeanLabel(post.lean)}
                        </span>
                        <EyeOff className="w-3 h-3 text-red-400 ml-auto flex-shrink-0" />
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2">{post.content}</p>
                      <p className="text-red-400/60 text-xs mt-1">Hidden by algorithm</p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom restart button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
