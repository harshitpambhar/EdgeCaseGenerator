import { motion } from 'framer-motion';

export default function TestPreview({ testCode, language = 'python', fileName = 'test_generated.py' }) {
  const defaultCode = `import pytest
from payment.handler import process_payment

class TestProcessPayment:
    """AI-generated test cases for process_payment()"""

    def test_valid_payment_success(self):
        """Test successful payment with valid card"""
        result = process_payment(
            amount=99.99,
            card="4111111111111111",
            currency="USD"
        )
        assert result.status == "success"
        assert result.transaction_id is not None

    def test_negative_amount_raises_error(self):
        """Edge case: negative payment amount"""
        with pytest.raises(ValueError):
            process_payment(amount=-50.00, card="4111111111111111")

    def test_expired_card_declined(self):
        """Edge case: expired credit card"""
        result = process_payment(
            amount=25.00,
            card="4000000000000069",
            exp_date="01/20"
        )
        assert result.status == "declined"
        assert result.error_code == "CARD_EXPIRED"`;

  const code = testCode || defaultCode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[2rem] glass-panel overflow-hidden border-white/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter">AI SYNTHESIZED</span>
          </div>
          <span className="text-[9px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-black uppercase tracking-tighter">{language}</span>
        </div>
      </div>

      {/* Code */}
      <div className="p-6 overflow-x-auto bg-[#050816]/30">
        <pre className="text-sm leading-7 font-mono m-0">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex hover:bg-white/[0.03] -mx-6 px-6 transition-colors group">
              <span className="select-none w-10 text-right mr-6 text-slate-700 font-black text-[10px] leading-7 flex-shrink-0 group-hover:text-cyan-400 transition-colors">{i + 1}</span>
              <code className="text-slate-300 font-medium">
                {line || ' '}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  );
}
