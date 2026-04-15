import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, ChevronRight, AlertTriangle } from 'lucide-react';

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-white/30"
            style={{ top: `${(i + 1) * 5}%`, left: 0, right: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10 max-w-sm"
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 via-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Eye className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-white text-3xl mb-3">BubbleScope</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            An interactive experiment that shows how social media algorithms shape what you see — and what you don't.
          </p>
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            How It Works <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center z-10 max-w-sm"
        >
          <div className="space-y-6 mb-10 text-left">
            {[
              { emoji: '📱', title: 'Swipe through posts', desc: 'A TikTok-style feed of political content from all perspectives.' },
              { emoji: '❤️', title: 'Engage naturally', desc: 'Like, comment, or share posts that resonate with you. Or just swipe past.' },
              { emoji: '🔄', title: 'Watch the shift', desc: 'The algorithm learns your preferences and narrows your feed in real time.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-4 items-start"
              >
                <span className="text-2xl mt-1">{item.emoji}</span>
                <div>
                  <p className="text-white">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center z-10 max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </motion.div>
          <h2 className="text-white text-2xl mb-3">Important Note</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            The content you'll see represents <span className="text-white">exaggerated political viewpoints</span> designed to demonstrate how algorithms amplify bias.
          </p>
          <p className="text-gray-500 text-xs mb-8 leading-relaxed">
            None of this content represents our views. This is purely educational — meant to show how filter bubbles form in real social media platforms.
          </p>
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 via-purple-600 to-blue-500 text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Start the Experiment
          </button>
        </motion.div>
      )}

      {/* Step dots */}
      <div className="absolute bottom-10 flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === step ? 'bg-white w-6' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
