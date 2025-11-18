import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface BondPrintResultsProps {
  bondPrint: any;
  onContinue: () => void;
}

export function BondPrintResults({ bondPrint, onContinue }: BondPrintResultsProps) {
  return (
    <div 
      className="min-h-screen p-6 pb-24 overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, #F3F4FF 0%, #FFE5EC 50%, #FFF5E6 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Success Toast */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mb-6 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-3"
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#10B981' }}
        >
          <Check className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold" style={{ color: '#1A1D2E', fontSize: '14px' }}>
          Your Bond Print is ready! 🎉
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #C084FC 0%, #E879F9 100%)',
              boxShadow: '0 8px 24px rgba(192, 132, 252, 0.4)',
            }}
          >
            <Heart className="w-12 h-12 text-white fill-white" />
          </motion.div>

          <h1 
            className="text-3xl mb-3"
            style={{
              fontWeight: '800',
              color: '#1A1D2E',
              letterSpacing: '-0.02em',
            }}
          >
            Your Bond Print is Ready! 🎉
          </h1>

          <p 
            className="text-base px-4"
            style={{ 
              color: '#6B6B6B',
              lineHeight: '1.6',
            }}
          >
            {bondPrint.summary || 'A balanced individual who thrives in mix of both settings'}
          </p>
        </div>

        {/* Your Personality Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" style={{ color: '#C084FC' }} />
            <h2 
              className="text-xl"
              style={{
                fontWeight: '700',
                color: '#1A1D2E',
              }}
            >
              Your Personality
            </h2>
          </div>

          <div 
            className="inline-block px-4 py-2 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, #C084FC 0%, #E879F9 100%)',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
            }}
          >
            {bondPrint.personality?.primaryType || 'Balanced Individual'}
          </div>

          <p 
            className="mb-4"
            style={{ 
              color: '#6B6B6B',
              fontSize: '15px',
              lineHeight: '1.6',
            }}
          >
            {bondPrint.personality?.description || 
              "You're a balanced individual who values authentic connections and personal growth. You bring a unique perspective to friendships and living situations."}
          </p>

          {bondPrint.personality?.secondaryTraits && bondPrint.personality.secondaryTraits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bondPrint.personality.secondaryTraits.map((trait: string) => (
                <span 
                  key={trait}
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ 
                    background: 'rgba(192, 132, 252, 0.1)',
                    color: '#1A1D2E',
                    border: '1px solid rgba(192, 132, 252, 0.2)'
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Communication Style Card */}
        {bondPrint.communication && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-lg mb-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💬</span>
              <h2 
                className="text-xl"
                style={{
                  fontWeight: '700',
                  color: '#1A1D2E',
                }}
              >
                Communication Style
              </h2>
            </div>

            <div 
              className="inline-block px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(192, 132, 252, 0.1)',
                fontSize: '15px',
                fontWeight: '600',
                color: '#C084FC',
              }}
            >
              {bondPrint.communication.style || 'Balanced Communicator'}
            </div>

            <div className="space-y-3">
              {(bondPrint.communication.preferences || [
                'Prefers thoughtful, considered responses',
                'Appreciates practical solutions'
              ]).map((pref: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#10B981' }} />
                  <span 
                    style={{ 
                      color: '#6B6B6B',
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}
                  >
                    {pref}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Social Preferences Card */}
        {bondPrint.social && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👥</span>
              <h2 
                className="text-xl"
                style={{
                  fontWeight: '700',
                  color: '#1A1D2E',
                }}
              >
                Social Preferences
              </h2>
            </div>

            <div className="space-y-4">
              {bondPrint.social.idealSetting && (
                <div>
                  <span 
                    className="text-sm font-semibold block mb-1"
                    style={{ color: '#6B6B6B' }}
                  >
                    Ideal Setting
                  </span>
                  <p style={{ color: '#1A1D2E', fontSize: '15px', fontWeight: '600' }}>
                    {bondPrint.social.idealSetting}
                  </p>
                </div>
              )}
              {bondPrint.social.rechargeMethod && (
                <div>
                  <span 
                    className="text-sm font-semibold block mb-1"
                    style={{ color: '#6B6B6B' }}
                  >
                    Recharge Method
                  </span>
                  <p style={{ color: '#1A1D2E', fontSize: '15px', fontWeight: '600' }}>
                    {bondPrint.social.rechargeMethod}
                  </p>
                </div>
              )}
              {bondPrint.social.friendshipStyle && (
                <div>
                  <span 
                    className="text-sm font-semibold block mb-1"
                    style={{ color: '#6B6B6B' }}
                  >
                    Friendship Style
                  </span>
                  <p style={{ color: '#1A1D2E', fontSize: '15px', fontWeight: '600' }}>
                    {bondPrint.social.friendshipStyle}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onContinue}
            className="w-full text-white border-none shadow-lg"
            size="lg"
            style={{
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #C084FC 0%, #E879F9 100%)',
              fontSize: '17px',
              fontWeight: '700',
            }}
          >
            Start Finding Connections
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p 
            className="text-center mt-4"
            style={{ 
              color: '#6B6B6B',
              fontSize: '13px',
            }}
          >
            Your Bond Print helps us match you with friends, roommates, and potential dates 💜
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
