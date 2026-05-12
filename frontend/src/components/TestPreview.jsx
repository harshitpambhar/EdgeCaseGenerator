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
        assert result.error_code == "CARD_EXPIRED"

    def test_zero_amount_boundary(self):
        """Boundary: zero amount payment"""
        with pytest.raises(ValueError, match="Amount must be positive"):
            process_payment(amount=0, card="4111111111111111")`;

  const code = testCode || defaultCode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-[#1E293B]/60 border border-[#334155]/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A]/60 border-b border-[#334155]/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
            <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#818CF8] font-medium">AI Generated</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#34D399] font-medium">{language}</span>
        </div>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-6 font-mono text-[#94A3B8] m-0">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex hover:bg-[#334155]/20 -mx-4 px-4">
              <span className="select-none w-8 text-right mr-4 text-[#64748B]/50 text-xs leading-6 flex-shrink-0">{i + 1}</span>
              <code className="text-[#E2E8F0]">{line}</code>
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  );
}
