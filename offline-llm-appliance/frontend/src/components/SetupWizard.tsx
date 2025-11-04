/**
 * SetupWizard.tsx
 * Purpose: Multi-step onboarding wizard per final spec
 * Usage: Displayed on first application launch to configure MONAD
 * Privacy: Stores all configuration data locally, encrypted after password step
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore, getWizardData } from '../lib/wizardStore';
import { validateStep, validatePassword } from '../lib/validation';
import { setupPassword, encryptForLocal } from '../lib/auth';
import { createStarterChatsFromWizard } from '../chats/registry';
import { saveConfig } from '../lib/config';

// Step definitions per spec
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'name', label: 'Your Name' },
  { id: 'password', label: 'Password' },
  { id: 'useType', label: 'Use Type' },
  { id: 'sector', label: 'Sector' },
  { id: 'subSectors', label: 'Sub-sectors' },
  { id: 'roles', label: 'Roles' },
  { id: 'prefs', label: 'Preferences' },
  { id: 'review', label: 'Review' },
];

const TOTAL_STEPS = STEPS.length;

// Sector options
const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Creative',
  'Legal',
  'Sales',
  'Engineering',
  'Other',
];

// Sub-sector examples (expandable per sector)
const SUB_SECTORS: Record<string, string[]> = {
  Technology: ['Software', 'Hardware', 'AI/ML', 'Cloud', 'Security', 'DevOps'],
  Healthcare: ['Clinical', 'Research', 'Pharma', 'Medical Devices', 'Telemedicine'],
  Finance: ['Banking', 'Investment', 'Insurance', 'FinTech', 'Accounting'],
  Education: ['K-12', 'Higher Ed', 'Training', 'EdTech', 'Research'],
  Creative: ['Design', 'Writing', 'Film', 'Music', 'Photography'],
  Legal: ['Corporate', 'Litigation', 'IP', 'Compliance', 'Real Estate'],
  Sales: ['B2B', 'B2C', 'E-commerce', 'Inside Sales', 'Account Management'],
  Engineering: ['Mechanical', 'Electrical', 'Civil', 'Software', 'Biomedical'],
  Other: ['General', 'Consulting', 'Non-profit', 'Government'],
};

// Role options
const ROLES = [
  'Executive',
  'Manager',
  'Individual Contributor',
  'Consultant',
  'Entrepreneur',
  'Researcher',
  'Educator',
  'Creative Professional',
  'Other',
];

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const {
    stepIndex,
    setStep,
    nextStep,
    prevStep,
    setField,
    reset,
    name,
    passwordSet,
    useType,
    sector,
    subSectors,
    roles,
    roleOther,
    prefs,
  } = useWizardStore();

  const [localPassword, setLocalPassword] = useState('');
  const [localPasswordConfirm, setLocalPasswordConfirm] = useState('');
  const [localPasswordHint, setLocalPasswordHint] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS[stepIndex];
  const wizardData = getWizardData();

  // Focus input on step change
  useEffect(() => {
    if (stepIndex > 0 && stepIndex < STEPS.length - 1) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [stepIndex]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEscape();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        if (stepIndex !== 2 && stepIndex !== 6 && stepIndex !== 8) {
          // Password, roles (multi-select), and review steps handled separately
        e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stepIndex, wizardData]);

  const playSound = (sound: string) => {
    try {
      const audio = new Audio(`/sounds/${sound}`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // Silent fail
    }
  };

  const handleEscape = () => {
    const confirmed = window.confirm('Cancel setup? Your progress will be saved.');
    if (confirmed) {
      reset();
      // Would navigate back, but for now just stay on wizard
    }
  };

  const handleNext = async () => {
    // Validate current step
    const validation = validateStep(stepIndex, { ...wizardData, useType: useType || undefined });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    // Special handling for password step
    if (stepIndex === 2) {
      // Password step - handled in handlePasswordSubmit
      return;
    }

    // Special handling for roles step if "Other" selected
    if (stepIndex === 6) {
      if (roles.includes('Other') && (!roleOther || roleOther.trim().length === 0)) {
        setErrors(['Role description is required when "Other" is selected']);
        return;
      }
    }

    // Special handling for review step - create chats and complete
    if (stepIndex === STEPS.length - 1) {
      await handleComplete();
      return;
    }

    // Skip conditional steps if not needed
    if (stepIndex === 3 && (useType === 'Personal')) {
      // Skip sector, sub-sectors, roles for Personal
      setStep(7); // Go to prefs
      playSound('click.wav');
      return;
    }

    playSound('click.wav');
    nextStep();
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setErrors([]);
      playSound('click.wav');

      // Skip conditional steps going back
      if (stepIndex === 7 && useType === 'Personal') {
        setStep(3); // Go back to useType
        return;
      }

      prevStep();
    }
  };

  const handlePasswordSubmit = async () => {
    // Validate password
    if (localPassword.length < 12) {
      setErrors(['Password must be at least 12 characters']);
      return;
    }

    const passwordValidation = validatePassword(localPassword);
    if (!passwordValidation.valid) {
      setErrors(passwordValidation.errors);
      return;
    }

    if (localPassword !== localPasswordConfirm) {
      setErrors(['Passwords do not match']);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const result = await setupPassword(
        localPassword,
        localPasswordHint || undefined
      );

      if (result.success) {
        setField('passwordSet', true);
        setField('passwordHint', localPasswordHint || undefined);
        
        // Encrypt and persist wizard state
        try {
          const encrypted = await encryptForLocal(wizardData);
          localStorage.setItem('monad_wizard_encrypted', encrypted);
        } catch (err) {
          console.error('[Wizard] Failed to encrypt state:', err);
          // Continue anyway - state is in store
        }

        // Clear password fields
        setLocalPassword('');
        setLocalPasswordConfirm('');
        
        playSound('confirm.mp3');
        nextStep();
      } else {
        setErrors([result.error || 'Failed to set password']);
      }
    } catch (error) {
      console.error('[Wizard] Password setup error:', error);
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      // Create starter chats
      await createStarterChatsFromWizard(wizardData);

      // Save config for dashboard
      saveConfig({
        name: name,
        role: useType || 'Personal',
        tone: prefs.tone,
        language: prefs.spelling === 'UK' ? 'English (UK)' : 'English (US)',
        goal: 'Assist the user intelligently and privately.',
        theme: 'Midnight',
        interests: [],
        securityLevel: passwordSet ? 'secure' : 'standard',
        savePreference: 'always',
      });

      // Clear wizard state
      reset();

      playSound('confirm.mp3');
      
      // Wait a moment for sound
      setTimeout(() => {
        onComplete();
      }, 300);
    } catch (error) {
      console.error('[Wizard] Completion error:', error);
      setErrors(['Failed to create starter chats. Please try again.']);
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to MONAD
              </h1>
            <p className="text-gray-400 mb-4 text-xl">
              Let's calibrate your personal AI assistant
            </p>
            <p className="text-gray-500 text-sm mb-8">
              This process will personalize MONAD to work exactly how you need it.
            </p>
          </div>
        );

      case 1:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">What should I call you?</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your name helps MONAD personalize responses and greetings.
            </p>
              <input
              ref={inputRef}
                type="text"
              value={name}
              onChange={(e) => {
                setField('name', e.target.value);
                setErrors([]);
              }}
              placeholder="Enter your name"
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
            />
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">Set Your Password</h2>
            <p className="text-gray-400 text-sm mb-6">
              Minimum 12 characters with uppercase, lowercase, number, and symbol.
            </p>
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="password"
                value={localPassword}
                onChange={(e) => {
                  setLocalPassword(e.target.value);
                  setErrors([]);
                }}
                placeholder="Enter password"
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
              />
              <input
                type="password"
                value={localPasswordConfirm}
                onChange={(e) => {
                  setLocalPasswordConfirm(e.target.value);
                  setErrors([]);
                }}
                placeholder="Confirm password"
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
              />
              <input
                type="text"
                value={localPasswordHint}
                onChange={(e) => setLocalPasswordHint(e.target.value)}
                placeholder="Password hint (optional)"
                className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
              />
              </div>
            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading || !localPassword || !localPasswordConfirm}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Setting Password...' : 'Set Password & Continue'}
            </button>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">How will you use MONAD?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This determines the focus of MONAD's capabilities.
            </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Personal', 'Professional', 'Both'].map((type) => (
                  <motion.button
                  key={type}
                  onClick={() => {
                    setField('useType', type as 'Personal' | 'Professional' | 'Both');
                    setTimeout(() => handleNext(), 300);
                  }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    useType === type
                      ? 'border-blue-400 bg-blue-600/20'
                      : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <div className="font-semibold text-lg">{type}</div>
                  </motion.button>
                ))}
              </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">What industry do you work in?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This helps MONAD understand your professional context.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SECTORS.map((s) => (
                  <motion.button
                  key={s}
                  onClick={() => {
                    setField('sector', s);
                    setTimeout(() => handleNext(), 300);
                  }}
                    className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    sector === s
                      ? 'border-blue-400 bg-blue-600'
                      : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                  {s}
                  </motion.button>
                ))}
              </div>
          </>
        );

      case 5:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">Select Sub-sectors</h2>
            <p className="text-gray-400 text-sm mb-6">
              Select all that apply (at least one required).
            </p>
            <div className="flex flex-wrap gap-3">
              {(SUB_SECTORS[sector || ''] || []).map((sub) => (
                    <motion.button
                  key={sub}
                  onClick={() => {
                    const current = subSectors || [];
                    const updated = current.includes(sub)
                      ? current.filter((s) => s !== sub)
                      : [...current, sub];
                    setField('subSectors', updated);
                  }}
                  className={`px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                    (subSectors || []).includes(sub)
                      ? 'border-blue-400 bg-blue-600'
                      : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sub}
                </motion.button>
              ))}
              </div>
          </>
        );

      case 6:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">Select Your Roles</h2>
            <p className="text-gray-400 text-sm mb-6">
              Select all that apply (at least one required).
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {ROLES.map((role) => (
                    <motion.button
                  key={role}
                  onClick={() => {
                    const current = roles || [];
                    const updated = current.includes(role)
                      ? current.filter((r) => r !== role)
                      : [...current, role];
                    setField('roles', updated);
                  }}
                  className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    (roles || []).includes(role)
                      ? 'border-blue-400 bg-blue-600'
                      : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {role}
                    </motion.button>
              ))}
                  </div>
            {(roles || []).includes('Other') && (
                  <div>
                    <input
                  ref={inputRef}
                  type="text"
                  value={roleOther || ''}
                  onChange={(e) => setField('roleOther', e.target.value)}
                  placeholder="Describe your role"
                      className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
                    />
                  </div>
                )}
          </>
        );

      case 7:
        return (
          <>
            <h2 className="text-3xl font-bold mb-4">Preferences</h2>
            <p className="text-gray-400 text-sm mb-6">
              Fine-tune MONAD's response style.
            </p>
            <div className="space-y-6">
              <div>
                <label className="text-lg font-medium mb-3 block">Tone</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Professional', 'Friendly', 'Technical', 'Creative', 'Concise'].map((t) => (
                  <motion.button
                      key={t}
                      onClick={() => setField('prefs', { ...prefs, tone: t as typeof prefs.tone })}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        prefs.tone === t
                          ? 'border-blue-400 bg-blue-600'
                          : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                      }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                      {t}
                </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-3 block">Response Length: {prefs.length}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={prefs.length}
                  onChange={(e) => setField('prefs', { ...prefs, length: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Brief</span>
                  <span>Comprehensive</span>
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-3 block">Spelling</label>
                <div className="grid grid-cols-2 gap-3">
                  {['UK', 'US'].map((s) => (
                <motion.button 
                      key={s}
                      onClick={() => setField('prefs', { ...prefs, spelling: s as 'UK' | 'US' })}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        prefs.spelling === s
                          ? 'border-blue-400 bg-blue-600'
                          : 'border-slate-600 bg-slate-800/50 hover:border-blue-400/50'
                      }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                      English ({s})
                </motion.button>
                  ))}
              </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-lg ${!prefs.clarifyFirst ? 'text-gray-400' : 'text-white'}`}>No</span>
                <button
                  onClick={() => setField('prefs', { ...prefs, clarifyFirst: !prefs.clarifyFirst })}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    prefs.clarifyFirst ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      prefs.clarifyFirst ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-lg ${prefs.clarifyFirst ? 'text-gray-400' : 'text-white'}`}>Yes</span>
                <span className="ml-4 text-sm text-gray-400">Clarify First</span>
              </div>
            </div>
          </>
        );

      case 8:
        return (
          <>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Review
                </h2>
            <p className="text-gray-400 mb-6 text-xl">
              Ready to start MONAD?
            </p>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-600 max-h-96 overflow-y-auto text-left">
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-400">Name:</span> <span className="text-white">{name}</span></div>
                <div><span className="text-gray-400">Use Type:</span> <span className="text-white">{useType}</span></div>
                {useType === 'Professional' || useType === 'Both' ? (
                  <>
                    <div><span className="text-gray-400">Sector:</span> <span className="text-white">{sector}</span></div>
                    <div><span className="text-gray-400">Sub-sectors:</span> <span className="text-white">{(subSectors || []).join(', ')}</span></div>
                    <div><span className="text-gray-400">Roles:</span> <span className="text-white">{(roles || []).join(', ')}</span></div>
                  </>
                ) : null}
                <div><span className="text-gray-400">Tone:</span> <span className="text-white">{prefs.tone}</span></div>
                <div><span className="text-gray-400">Length:</span> <span className="text-white">{prefs.length}</span></div>
                <div><span className="text-gray-400">Spelling:</span> <span className="text-white">{prefs.spelling}</span></div>
                <div><span className="text-gray-400">Clarify First:</span> <span className="text-white">{prefs.clarifyFirst ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Chats...' : 'Start MONAD'}
            </button>
          </>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-8 relative overflow-hidden">
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

      {/* Progress Bar */}
      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-80"
        initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Step {stepIndex + 1} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-gray-400">{currentStep?.label || 'Unknown'}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
                  </div>
                </motion.div>

      {/* Logo */}
      <motion.div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10"
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

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl relative z-10"
        >
          {renderStep()}

          {/* Error Messages */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-xl text-red-400 text-sm"
            >
              {errors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {stepIndex !== 2 && stepIndex !== 8 && (
            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          <p className="text-gray-600 text-xs mt-4 text-center">
            {stepIndex === 2 ? 'Set password to continue' : stepIndex === 8 ? 'Click Start to finish' : 'Press Enter to continue • Esc to cancel'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
