'use client';

import { createRule } from '@/lib/merchant-rules';
import { extractMerchantToken } from '@/lib/merchant-tokenizer';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MerchantRulePromptProps {
  merchantName: string;
  category: string;
  onDismiss: () => void;
  className?: string;
}

export function MerchantRulePrompt({
  merchantName,
  category,
  onDismiss,
  className,
}: MerchantRulePromptProps) {
  const t = useTranslations('budget.merchantRules');
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleAccept = async () => {
    const token = extractMerchantToken(merchantName) ?? merchantName.toLowerCase();
    await createRule(token, merchantName, category);
    setVisible(false);
    onDismiss();
  };

  const handleReject = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn(
            'flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-900/95 px-4 py-2.5 shadow-lg backdrop-blur-sm',
            className
          )}
        >
          <p className="flex-1 text-xs text-slate-300">
            {t('createRule', { merchant: merchantName, category })}
          </p>
          <button
            onClick={handleAccept}
            className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-600/30"
          >
            <Check className="h-3 w-3" />
            {t('yes')}
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-3 w-3" />
            {t('no')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
