import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveConfig } from "../lib/config";

const roles = [
  { name: "Professional Assistant", desc: "Helps with writing, research, and productivity." },
  { name: "Creative Partner", desc: "Aids in ideation, storytelling, and expression." },
  { name: "Developer Companion", desc: "Analyses, debugs, and improves codebases." },
  { name: "Learning Mentor", desc: "Guides study sessions and explains complex ideas." },
  { name: "Mindfulness Guide", desc: "Supports reflection and mental clarity." },
  { name: "General AI", desc: "Adapts dynamically to any domain or need." }
];

const tones = [
  { name: "Professional", blurb: "Polished and precise responses." },
  { name: "Friendly", blurb: "Warm, conversational, human-like." },
  { name: "Creative", blurb: "Metaphoric, expressive, artistic tone." },
  { name: "Analytical", blurb: "Detailed, data-driven insights." },
  { name: "Supportive", blurb: "Encouraging and emotionally aware." },
  { name: "Concise", blurb: "Minimalist, straight-to-the-point replies." },
  { name: "Philosophical", blurb: "Reflective, deep-thinking, mindful tone." },
  { name: "Playful", blurb: "Humorous, light-hearted, adaptive." },
  { name: "Technical", blurb: "Engineer-grade explanations and precision." }
];

const languageOptions = ["English (UK)", "English (US)", "Spanish", "French", "German", "Italian", "Japanese", "Chinese"];
const themeOptions = ["Dark", "Dim", "Midnight", "Light"];

const emotions = [
  { name: "Happy", color: "from-yellow-400 to-orange-400", icon: "😊" },
  { name: "Calm", color: "from-blue-400 to-cyan-400", icon: "😌" },
  { name: "Focused", color: "from-purple-400 to-pink-400", icon: "🎯" },
  { name: "Curious", color: "from-green-400 to-emerald-400", icon: "🤔" },
  { name: "Tired", color: "from-gray-400 to-slate-400", icon: "😴" },
  { name: "Inspired", color: "from-pink-400 to-rose-400", icon: "✨" },
  { name: "Anxious", color: "from-red-400 to-orange-400", icon: "😰" }
];

const interestSuggestions = [
  "AI", "writing", "fitness", "psychology", "business", "spirituality", "coding", "cinema", 
  "architecture", "music", "philosophy", "photography", "history", "design", "finance", "science",
  "cooking", "travel", "art", "technology", "nature", "meditation", "gaming", "sports"
];

const steps = [
  { id: "welcome", type: "intro", title: "Welcome to MONAD", subtitle: "Your intelligent offline companion" },
  { id: "userName", type: "input", question: "What's your name?", placeholder: "e.g. Joseph", required: true },
  { id: "name", type: "input", question: "What should I call myself?", placeholder: "e.g. MONAD, AURA, NOVA..." },
  { id: "role", type: "role", question: "What role should I serve for you?", options: roles },
  { id: "tone", type: "tone", question: "What communication style do you prefer?", options: tones },
  { id: "language", type: "choice", question: "Which language should I use?", options: languageOptions },
  { id: "goal", type: "input", question: "What goal would you like me to help you achieve?", placeholder: "e.g. Build a business, write a novel, learn coding..." },
  { id: "interests", type: "tags", question: "What topics or interests should I learn about?", placeholder: "Type interests (press Enter)" },
  { id: "emotion", type: "emotion", question: "How are you feeling right now?", options: emotions },
  { id: "energy", type: "energy", question: "What's your current energy level?" },
  { id: "security", type: "security", question: "Security & Privacy Settings" },
  { id: "saveMode", type: "saveMode", question: "How should MONAD handle your sessions?" },
  { id: "theme", type: "choice", question: "Choose your preferred theme", options: themeOptions },
  { id: "summary", type: "summary", title: "Calibration Complete", subtitle: "MONAD is synchronized and ready to serve you." },
];

export default function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({ 
    interests: [], 
    emotion: "Calm", 
    energy: 80,
    userName: "",
    securityLevel: "standard",
    password: "",
    saveMode: "always",
    selectedModel: "TinyLlama",
    reasoningLevel: "standard",
    typingIndicator: true,
    autosave: true,
    privacyBadge: true
  });
  const [currentInterest, setCurrentInterest] = useState("");
  const current = steps[index];

  const playSound = (sound: string) => {
    try {
      const audio = new Audio(`/sounds/${sound}`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Silent fail for missing sound files
    }
  };

  const next = () => {
    if (index < steps.length - 1) {
      playSound("click.wav");
      setIndex(index + 1);
    } else {
      playSound("confirm.mp3");
      saveConfig(answers);
      onComplete();
    }
  };

  const handleChoice = (field: string, value: string) => {
    playSound("select.wav");
    setAnswers({ ...answers, [field]: value });
    setTimeout(next, 300);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [current.id]: e.target.value });
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      const val = e.currentTarget.value.trim();
      if (!answers.interests.includes(val)) {
        playSound("select.wav");
        setAnswers({ ...answers, interests: [...answers.interests, val] });
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tag: string) => {
    playSound("click.wav");
    setAnswers({ 
      ...answers, 
      interests: answers.interests.filter((t: string) => t !== tag) 
    });
  };

  const addSuggestion = (suggestion: string) => {
    if (!answers.interests.includes(suggestion)) {
      playSound("select.wav");
      setAnswers({ ...answers, interests: [...answers.interests, suggestion] });
    }
  };

  const handleEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, energy: parseInt(e.target.value) });
  };

  const getEnergyColor = (energy: number) => {
    if (energy < 30) return "from-red-500 to-orange-500";
    if (energy < 60) return "from-orange-500 to-yellow-500";
    if (energy < 80) return "from-yellow-500 to-green-500";
    return "from-green-500 to-blue-500";
  };

  const getEnergyLabel = (energy: number) => {
    if (energy < 20) return "Exhausted";
    if (energy < 40) return "Low";
    if (energy < 60) return "Moderate";
    if (energy < 80) return "Good";
    return "Excellent";
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-8 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/MONAD_Logo.svg"
          alt="MONAD"
          className="w-16 h-16 opacity-80"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl relative z-10"
        >
          {current.type === "intro" && (
            <>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {current.title}
              </h1>
              <p className="text-gray-400 mb-8 text-xl">{current.subtitle}</p>
              <motion.button
                onClick={next}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin Calibration →
              </motion.button>
            </>
          )}

          {current.type === "input" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <input
                type="text"
                placeholder={current.placeholder}
                onChange={handleInput}
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
              />
              <div className="mt-8">
                <motion.button 
                  onClick={next} 
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
              </div>
            </>
          )}

          {current.type === "role" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {current.options.map((role: any) => (
                  <motion.button
                    key={role.name}
                    onClick={() => handleChoice(current.id, role.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      answers[current.id] === role.name 
                        ? "border-blue-400 bg-blue-600/20" 
                        : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-lg mb-2">{role.name}</div>
                    <div className="text-sm text-gray-400">{role.desc}</div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {current.type === "tone" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {current.options.map((tone: any) => (
                  <motion.button
                    key={tone.name}
                    onClick={() => handleChoice(current.id, tone.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      answers[current.id] === tone.name 
                        ? "border-blue-400 bg-blue-600/20" 
                        : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-lg mb-2">{tone.name}</div>
                    <div className="text-sm text-gray-400">{tone.blurb}</div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {current.type === "choice" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {current.options.map((opt: string) => (
                  <motion.button
                    key={opt}
                    onClick={() => handleChoice(current.id, opt)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      answers[current.id] === opt 
                        ? "border-blue-400 bg-blue-600" 
                        : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {current.type === "tags" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <input
                type="text"
                placeholder={current.placeholder}
                onKeyDown={addTag}
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600 mb-6"
              />
              
              {/* Interest suggestions */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {interestSuggestions
                  .filter(s => !answers.interests.includes(s))
                  .slice(0, 8)
                  .map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-blue-600/50 rounded-full text-sm transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
              </div>

              {/* Selected interests */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {answers.interests.map((tag: string, i: number) => (
                  <motion.span
                    key={i}
                    className="bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>

              <div className="mt-6">
                <motion.button 
                  onClick={next} 
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
              </div>
            </>
          )}

          {current.type === "emotion" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {current.options.map((emotion: any) => (
                  <motion.button
                    key={emotion.name}
                    onClick={() => handleChoice(current.id, emotion.name)}
                    className={`w-24 h-24 rounded-full border-4 transition-all duration-300 flex flex-col items-center justify-center ${
                      answers[current.id] === emotion.name 
                        ? "border-blue-400 bg-blue-600/20 scale-110" 
                        : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="text-2xl mb-1">{emotion.icon}</div>
                    <div className="text-xs font-medium">{emotion.name}</div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {current.type === "energy" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="w-full max-w-md mx-auto">
                <div className="text-2xl font-bold mb-4">
                  {getEnergyLabel(answers.energy)} ({answers.energy}%)
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={answers.energy}
                    onChange={handleEnergyChange}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f97316 30%, #eab308 60%, #22c55e 80%, #3b82f6 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="mt-6">
                  <motion.button 
                    onClick={next} 
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next →
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {current.type === "security" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium mb-3 block">Security Level</label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => handleChoice("securityLevel", "standard")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        answers.securityLevel === "standard" 
                          ? "border-blue-400 bg-blue-600/20" 
                          : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold text-lg mb-2">Standard</div>
                      <div className="text-sm text-gray-400">Faster boot, no encryption</div>
                    </motion.button>
                    <motion.button
                      onClick={() => handleChoice("securityLevel", "secure")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        answers.securityLevel === "secure" 
                          ? "border-blue-400 bg-blue-600/20" 
                          : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold text-lg mb-2">Secure</div>
                      <div className="text-sm text-gray-400">Encrypted storage, password protected</div>
                    </motion.button>
                  </div>
                </div>
                
                {answers.securityLevel === "secure" && (
                  <div>
                    <label className="text-lg font-medium mb-3 block">Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Enter password for encryption"
                      onChange={(e) => setAnswers({ ...answers, password: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
                    />
                  </div>
                )}
              </div>
              <div className="mt-8">
                <motion.button 
                  onClick={next} 
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
              </div>
            </>
          )}

          {current.type === "saveMode" && (
            <>
              <h2 className="text-3xl font-bold mb-6">{current.question}</h2>
              <div className="space-y-4">
                {[
                  { value: "always", label: "Always save", desc: "Automatically save all conversations" },
                  { value: "ask", label: "Ask each time", desc: "Prompt before saving sessions" },
                  { value: "never", label: "Never save", desc: "No conversation history stored" }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleChoice("saveMode", option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      answers.saveMode === option.value 
                        ? "border-blue-400 bg-blue-600/20" 
                        : "border-slate-600 bg-slate-800/50 hover:border-blue-400/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-lg mb-2">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.desc}</div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {current.type === "summary" && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  {current.title}
                </h2>
                <p className="text-gray-400 mb-8 text-xl">{current.subtitle}</p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-600"
                >
                  <div className="text-lg font-semibold mb-4">Your Configuration:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-400">User:</span> {answers.userName}</div>
                    <div><span className="text-gray-400">AI Name:</span> {answers.name}</div>
                    <div><span className="text-gray-400">Role:</span> {answers.role}</div>
                    <div><span className="text-gray-400">Tone:</span> {answers.tone}</div>
                    <div><span className="text-gray-400">Language:</span> {answers.language}</div>
                    <div><span className="text-gray-400">Emotion:</span> {answers.emotion}</div>
                    <div><span className="text-gray-400">Energy:</span> {answers.energy}%</div>
                    <div><span className="text-gray-400">Security:</span> {answers.securityLevel}</div>
                    <div><span className="text-gray-400">Save Mode:</span> {answers.saveMode}</div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={next}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch MONAD →
                </motion.button>
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}