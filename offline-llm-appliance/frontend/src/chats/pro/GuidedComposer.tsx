/**
 * GuidedComposer.tsx
 * Purpose: Floating chips UI for creating structured Pro Studio personas
 * Usage: Used by ProStudioChat to configure sector/sub-sectors/roles/voice/tone
 * Privacy: All configuration stored locally
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface GuidedComposerProps {
  initialConfig?: {
    sector?: string;
    subSectors?: string[];
    roles?: string[];
    roleOther?: string;
  };
  onComplete: (preset: unknown) => void;
  onCancel: () => void;
}

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
];

// Sub-sector options (simplified - would be dynamic per sector)
const SUB_SECTORS: Record<string, string[]> = {
  Technology: ['Software', 'Hardware', 'AI/ML', 'Cloud', 'Security'],
  Healthcare: ['Clinical', 'Research', 'Pharma', 'Telemedicine'],
  Finance: ['Banking', 'Investment', 'FinTech', 'Accounting'],
  Education: ['K-12', 'Higher Ed', 'EdTech', 'Research'],
  Creative: ['Design', 'Writing', 'Film', 'Music'],
  Legal: ['Corporate', 'Litigation', 'IP', 'Compliance'],
  Sales: ['B2B', 'B2C', 'E-commerce', 'Account Management'],
  Engineering: ['Mechanical', 'Electrical', 'Software', 'Biomedical'],
};

// Roles
const ROLES = [
  'Executive',
  'Manager',
  'Individual Contributor',
  'Consultant',
  'Entrepreneur',
  'Researcher',
  'Other',
];

// Voice/Tone examples
const VOICE_EXAMPLES = [
  { name: 'Professional', example: 'Analytical and data-driven' },
  { name: 'Friendly', example: 'Approachable and supportive' },
  { name: 'Technical', example: 'Precise and detailed' },
  { name: 'Creative', example: 'Inspiring and innovative' },
];

export default function GuidedComposer({
  initialConfig,
  onComplete,
  onCancel,
}: GuidedComposerProps) {
  const [sector, setSector] = useState(initialConfig?.sector || '');
  const [subSectors, setSubSectors] = useState<string[]>(initialConfig?.subSectors || []);
  const [roles, setRoles] = useState<string[]>(initialConfig?.roles || []);
  const [roleOther, setRoleOther] = useState(initialConfig?.roleOther || '');
  const [roleIdentity, setRoleIdentity] = useState('');
  const [roleScope, setRoleScope] = useState('');
  const [voice, setVoice] = useState('Professional');
  const [tone] = useState('Professional');
  const [audience, setAudience] = useState('Practitioner');
  const [responseStyle, setResponseStyle] = useState('Structured');
  const [successCriteria] = useState<string[]>([]);

  const handleToggleSubSector = (sub: string) => {
    setSubSectors((current) =>
      current.includes(sub)
        ? current.filter((s) => s !== sub)
        : [...current, sub]
    );
  };

  const handleToggleRole = (role: string) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role]
    );
  };

  const handleComplete = () => {
    const preset = {
      sector,
      subSectors,
      roles,
      roleOther: roles.includes('Other') ? roleOther : undefined,
      roleIdentity,
      roleScope,
      voice,
      tone,
      audience,
      responseStyle,
      successCriteria,
    };

    onComplete(preset);
  };

  const canComplete =
    sector &&
    subSectors.length > 0 &&
    roles.length > 0 &&
    (!roles.includes('Other') || roleOther.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Configure Pro Studio</h3>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Sector */}
        <div>
          <label className="block text-sm font-medium mb-2">Sector *</label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSector(s);
                  setSubSectors([]); // Reset sub-sectors
                }}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  sector === s
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-sectors */}
        {sector && (
          <div>
            <label className="block text-sm font-medium mb-2">Sub-sectors *</label>
            <div className="flex flex-wrap gap-2">
              {(SUB_SECTORS[sector] || []).map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleToggleSubSector(sub)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    subSectors.includes(sub)
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {sub}
                  {subSectors.includes(sub) && <Check className="w-3 h-3 inline ml-1" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium mb-2">Roles *</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleToggleRole(role)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  roles.includes(role)
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                {role}
                {roles.includes(role) && <Check className="w-3 h-3 inline ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Role Other */}
        {roles.includes('Other') && (
          <div>
            <label className="block text-sm font-medium mb-2">Describe Your Role *</label>
            <input
              type="text"
              value={roleOther}
              onChange={(e) => setRoleOther(e.target.value)}
              placeholder="Enter your role description"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            />
          </div>
        )}

        {/* Role Identity */}
        <div>
          <label className="block text-sm font-medium mb-2">Role Identity</label>
          <textarea
            value={roleIdentity}
            onChange={(e) => setRoleIdentity(e.target.value)}
            placeholder="How do you want me to think of your role?"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            rows={2}
          />
        </div>

        {/* Role Scope */}
        <div>
          <label className="block text-sm font-medium mb-2">Role Scope</label>
          <textarea
            value={roleScope}
            onChange={(e) => setRoleScope(e.target.value)}
            placeholder="What tasks should I focus on?"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            rows={2}
          />
        </div>

        {/* Voice/Tone */}
        <div>
          <label className="block text-sm font-medium mb-2">Voice & Tone</label>
          <div className="grid grid-cols-2 gap-3">
            {VOICE_EXAMPLES.map((v) => (
              <button
                key={v.name}
                onClick={() => setVoice(v.name)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  voice === v.name
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className="font-semibold">{v.name}</div>
                <div className="text-xs text-gray-400">{v.example}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
          >
            <option value="Novice">Novice</option>
            <option value="Practitioner">Practitioner</option>
            <option value="Expert">Expert</option>
            <option value="Auditorium">Auditorium</option>
          </select>
        </div>

        {/* Response Style */}
        <div>
          <label className="block text-sm font-medium mb-2">Response Style</label>
          <select
            value={responseStyle}
            onChange={(e) => setResponseStyle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
          >
            <option value="Structured">Structured</option>
            <option value="Narrative">Narrative</option>
            <option value="Technical">Technical</option>
            <option value="Conversational">Conversational</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleComplete}
          disabled={!canComplete}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Complete Setup
        </button>
      </div>
    </motion.div>
  );
}
