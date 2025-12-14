import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Euro,
  Percent,
  Calendar,
  TrendingDown,
  PiggyBank,
  Info,
  Share2,
  Copy,
  Building2
} from 'lucide-react';

function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(350000);
  const [downPayment, setDownPayment] = useState(70000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(20);
  const [interestRate, setInterestRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.36);
  const [results, setResults] = useState(null);

  // Sync down payment percentage
  useEffect(() => {
    const percent = (downPayment / propertyPrice) * 100;
    setDownPaymentPercent(Math.round(percent));
  }, [downPayment, propertyPrice]);

  const handleDownPaymentPercentChange = (percent) => {
    setDownPaymentPercent(percent);
    setDownPayment(Math.round(propertyPrice * (percent / 100)));
  };

  useEffect(() => {
    calculate();
  }, [propertyPrice, downPayment, loanTerm, interestRate, insuranceRate]);

  const calculate = () => {
    const principal = propertyPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Monthly loan payment (PMT formula)
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    // Monthly insurance
    const monthlyInsurance = (principal * (insuranceRate / 100)) / 12;
    
    // Total monthly
    const totalMonthly = monthlyPayment + monthlyInsurance;
    
    // Total cost
    const totalInterest = (monthlyPayment * numberOfPayments) - principal;
    const totalInsurance = monthlyInsurance * numberOfPayments;
    const totalCost = propertyPrice + totalInterest + totalInsurance;
    
    // Notary fees (approximately 8% for old, 3% for new)
    const notaryFees = propertyPrice * 0.08;
    
    // Total project cost
    const totalProjectCost = totalCost + notaryFees;
    
    // Amortization schedule (first year)
    const schedule = [];
    let balance = principal;
    for (let month = 1; month <= Math.min(12, numberOfPayments); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    setResults({
      principal,
      monthlyPayment,
      monthlyInsurance,
      totalMonthly,
      totalInterest,
      totalInsurance,
      totalCost,
      notaryFees,
      totalProjectCost,
      schedule,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const copyResults = () => {
    const text = `
Simulation crédit immobilier
-----------------------------
Prix du bien: ${formatCurrency(propertyPrice)}
Apport: ${formatCurrency(downPayment)} (${downPaymentPercent}%)
Montant emprunté: ${formatCurrency(results.principal)}
Durée: ${loanTerm} ans
Taux: ${interestRate}%

Mensualité: ${formatCurrencyDetailed(results.totalMonthly)}
Coût total du crédit: ${formatCurrency(results.totalCost)}
    `.trim();
    navigator.clipboard.writeText(text);
    alert('Résultats copiés !');
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calculator size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Simulateur de prêt</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Calculez les mensualités de vos clients
              </p>
            </div>
          </div>
          {results && (
            <button
              onClick={copyResults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Copy size={16} />
              Copier
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Calculator Form */}
        <div style={{
          padding: '28px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          {/* Property Price */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              <Building2 size={18} style={{ color: 'var(--gold)' }} />
              Prix du bien
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="10000"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, var(--gold) ${(propertyPrice - 50000) / (2000000 - 50000) * 100}%, var(--border-color) 0%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>50 000 €</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold)' }}>
                  {formatCurrency(propertyPrice)}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2 000 000 €</span>
              </div>
            </div>
          </div>

          {/* Down Payment */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              <PiggyBank size={18} style={{ color: 'var(--gold)' }} />
              Apport personnel
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[10, 15, 20, 25, 30].map(percent => (
                <button
                  key={percent}
                  onClick={() => handleDownPaymentPercentChange(percent)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: downPaymentPercent === percent ? 'var(--gold)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (downPaymentPercent === percent ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    color: downPaymentPercent === percent ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Euro size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 40px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              />
            </div>
          </div>

          {/* Loan Term */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              <Calendar size={18} style={{ color: 'var(--gold)' }} />
              Durée du prêt
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[10, 15, 20, 25].map(years => (
                <button
                  key={years}
                  onClick={() => setLoanTerm(years)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: loanTerm === years ? 'var(--gold)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (loanTerm === years ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '10px',
                    color: loanTerm === years ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {years} ans
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              <Percent size={18} style={{ color: 'var(--gold)' }} />
              Taux d'intérêt
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="range"
                min="1"
                max="7"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, var(--gold) ${(interestRate - 1) / 6 * 100}%, var(--border-color) 0%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                }}
              />
              <div style={{
                padding: '10px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--gold)',
                minWidth: '80px',
                textAlign: 'center',
              }}>
                {interestRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Insurance Rate */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              <TrendingDown size={18} style={{ color: 'var(--gold)' }} />
              Taux assurance
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={insuranceRate}
                onChange={(e) => setInsuranceRate(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, var(--gold) ${(insuranceRate - 0.1) / 0.9 * 100}%, var(--border-color) 0%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                }}
              />
              <div style={{
                padding: '10px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                minWidth: '80px',
                textAlign: 'center',
              }}>
                {insuranceRate.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Monthly Payment Card */}
            <div style={{
              padding: '28px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Mensualité totale
              </p>
              <p style={{ fontSize: '42px', fontWeight: '700', color: 'var(--gold)', marginBottom: '8px' }}>
                {formatCurrencyDetailed(results.totalMonthly)}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Dont {formatCurrencyDetailed(results.monthlyInsurance)} d'assurance
              </p>
            </div>

            {/* Breakdown */}
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                Détail du financement
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Montant emprunté', value: results.principal },
                  { label: 'Coût total intérêts', value: results.totalInterest },
                  { label: 'Coût total assurance', value: results.totalInsurance },
                  { label: 'Frais de notaire (≈8%)', value: results.notaryFees },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '8px',
                  marginTop: '4px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>Coût total du projet</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--gold)' }}>
                    {formatCurrency(results.totalProjectCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              gap: '12px',
            }}>
              <Info size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Cette simulation est indicative. Les taux et conditions peuvent varier selon les banques et votre profil emprunteur.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--gold);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--gold);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default MortgageCalculator;
