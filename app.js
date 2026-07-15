// Central Bucks School District Healthcare Plan Simulator - Core Logic

// 1. Default Premium Equivalency Rates per Bargaining Group (Excluding Dental & Vision)
const DEFAULT_PREMIUM_RATES = {
  cbea: {
    oa: { individual: 1139.67, parent_child: 2263.07, family: 3283.00 },
    oc1: { individual: 0, parent_child: 0, family: 0 },
    oc2: { individual: 939.43, parent_child: 1749.35, family: 2615.96 },
    oc3: { individual: 886.70, parent_child: 1754.70, family: 2546.50 }
  },
  act93: {
    oa: { individual: 1195.20, parent_child: 2365.33, family: 3461.93 },
    oc1: { individual: 1146.22, parent_child: 2127.09, family: 3052.22 },
    oc2: { individual: 1113.61, parent_child: 2069.00, family: 3113.22 },
    oc3: { individual: 1056.20, parent_child: 2077.90, family: 3060.50 }
  },
  confidential: {
    oa: { individual: 1163.80, parent_child: 2310.80, family: 3310.67 },
    oc1: { individual: 1173.57, parent_child: 2180.17, family: 3079.74 },
    oc2: { individual: 1139.52, parent_child: 2119.57, family: 3143.35 },
    oc3: { individual: 914.10, parent_child: 1808.50, family: 2562.20 }
  },
  support_12: {
    oa: { individual: 954.13, parent_child: 1873.67, family: 2708.47 },
    oc1: { individual: 910.00, parent_child: 1647.25, family: 2329.17 },
    oc2: { individual: 877.42, parent_child: 1589.21, family: 2390.17 },
    oc3: { individual: 815.00, parent_child: 1581.22, family: 2280.22 }
  },
  support_10: {
    oa: { individual: 954.13, parent_child: 1873.67, family: 2708.47 },
    oc1: { individual: 910.00, parent_child: 1647.25, family: 2329.17 },
    oc2: { individual: 877.42, parent_child: 1589.21, family: 2390.17 },
    oc3: { individual: 815.00, parent_child: 1581.22, family: 2280.22 }
  },
  transportation_12: {
    oa: { individual: 191.05, parent_child: 379.23, family: 549.21 },
    oc1: { individual: 0, parent_child: 0, family: 0 },
    oc2: { individual: 0, parent_child: 0, family: 0 },
    oc3: { individual: 94.91, parent_child: 187.61, family: 271.36 }
  },
  transportation_10: {
    oa: { individual: 191.05, parent_child: 379.23, family: 549.21 },
    oc1: { individual: 0, parent_child: 0, family: 0 },
    oc2: { individual: 0, parent_child: 0, family: 0 },
    oc3: { individual: 94.91, parent_child: 187.61, family: 271.36 }
  }
};

// 1.5. Default Voluntary Vision (Eye Med) Monthly Employee Rates
const DEFAULT_VISION_RATES = {
  individual: 5.62,
  parent_child: 10.68,
  family: 15.69
};

// 1.6. Default Voluntary Dental Monthly Employee Rates per Group
const DEFAULT_DENTAL_RATES = {
  cbea: { individual: 8.00, parent_child: 16.00, family: 24.00 }, // Available voluntary
  act93: { individual: 10.71, parent_child: 20.18, family: 34.69 }, // Available voluntary
  confidential: { individual: 6.00, parent_child: 12.00, family: 12.00 }, // Available voluntary
  support_12: { individual: 0, parent_child: 0, family: 0 }, // NOT available
  support_10: { individual: 0, parent_child: 0, family: 0 }, // NOT available
  transportation_12: { individual: 10.00, parent_child: 20.00, family: 30.00 }, // Available voluntary
  transportation_10: { individual: 10.00, parent_child: 20.00, family: 30.00 } // Available voluntary
};

// 1.7. Default Transportation Under 1080 Hours Rates
const DEFAULT_TRANS_UNDER_1080_RATES = {
  oa: { individual: 0, parent_child: 0, family: 0 }, // Not eligible
  oc1: { individual: 0, parent_child: 0, family: 0 },
  oc2: { individual: 0, parent_child: 0, family: 0 },
  oc3: { individual: 237.26, parent_child: 938.06, family: 1356.78 }
};

// 1.8. Paycycles per year
const PAY_PERIODS = {
  cbea: 24,
  act93: 24,
  confidential: 24,
  support_12: 24,
  support_10: 19,
  transportation_12: 24,
  transportation_10: 19
};

// 2. Default Employee Share Percentages per Bargaining Group
const DEFAULT_SHARE_PCTS = {
  cbea: { oa: 15, oc1: null, oc2: 23, oc3: 10 },
  act93: { oa: 15, oc1: 23, oc2: 23, oc3: 10 },
  confidential: { oa: 15, oc1: 23, oc2: 23, oc3: 10 },
  support_12: { oa: 15, oc1: 24, oc2: 24, oc3: 9 },
  support_10: { oa: 15, oc1: 24, oc2: 24, oc3: 9 },
  transportation_12: { oa: 100, oc1: null, oc2: null, oc3: 100 },
  transportation_10: { oa: 100, oc1: null, oc2: null, oc3: 100 }
};

// 3. Estimated Allowed Costs for Medical Services
const ALLOWED_COSTS = {
  pcp: 150,
  specialist: 250,
  urgent: 200,
  er: 950,
  inpatient_admission: 5000,
  inpatient_day: 800,
  outpatient: 3000,
  therapy: 150,
  chiro: 80,
  xray: 200,
  lab: 60,
  imaging: 900
};

// State Variables
let premiumRates = {};
let sharePcts = {};
let visionRates = {};
let dentalRates = {};
let transUnder1080Rates = {};
let activePreset = null;

// Initialize State from LocalStorage or Defaults
function initRates() {
  const CURRENT_VERSION = 'v6'; // Reset cache on v6 for restored base medical rates
  const savedVersion = localStorage.getItem('cbsd_app_version');
  if (savedVersion !== CURRENT_VERSION) {
    localStorage.removeItem('cbsd_premium_rates');
    localStorage.removeItem('cbsd_share_pcts');
    localStorage.removeItem('cbsd_vision_rates');
    localStorage.removeItem('cbsd_dental_rates');
    localStorage.removeItem('cbsd_trans_under_1080');
    localStorage.setItem('cbsd_app_version', CURRENT_VERSION);
  }

  const savedRates = localStorage.getItem('cbsd_premium_rates');
  const savedShares = localStorage.getItem('cbsd_share_pcts');
  const savedVision = localStorage.getItem('cbsd_vision_rates');
  const savedDental = localStorage.getItem('cbsd_dental_rates');
  const savedTrans = localStorage.getItem('cbsd_trans_under_1080');
  
  if (savedRates) {
    premiumRates = JSON.parse(savedRates);
  } else {
    premiumRates = JSON.parse(JSON.stringify(DEFAULT_PREMIUM_RATES));
  }
  
  if (savedShares) {
    sharePcts = JSON.parse(savedShares);
  } else {
    sharePcts = JSON.parse(JSON.stringify(DEFAULT_SHARE_PCTS));
  }

  if (savedVision) {
    visionRates = JSON.parse(savedVision);
  } else {
    visionRates = JSON.parse(JSON.stringify(DEFAULT_VISION_RATES));
  }

  if (savedDental) {
    dentalRates = JSON.parse(savedDental);
  } else {
    dentalRates = JSON.parse(JSON.stringify(DEFAULT_DENTAL_RATES));
  }

  if (savedTrans) {
    transUnder1080Rates = JSON.parse(savedTrans);
  } else {
    transUnder1080Rates = JSON.parse(JSON.stringify(DEFAULT_TRANS_UNDER_1080_RATES));
  }
}

// 4. Plan Benefits Config
const PLAN_BENEFITS = {
  oa: {
    name: 'Open Access',
    in: {
      deductible_ind: 0,
      deductible_fam: 0,
      oop_max_ind: 6600,
      oop_max_fam: 13200,
      pcp: 15,
      specialist: 25,
      urgent: 24,
      er: 100, // copay
      inpatient: 250, // copay per admission
      inpatient_per_day: false,
      outpatient: 100, // copay
      therapy_copay: 0, // no charge
      therapy_limit: 240,
      chiro_copay: 0,
      chiro_limit: 100,
      xray: 0,
      lab: 0,
      imaging: 0
    },
    out: {
      deductible_ind: 1000,
      deductible_fam: 3000,
      oop_max_ind: 10000,
      oop_max_fam: 30000,
      coinsurance: 0.50, // 50% coinsurance after deductible
      pcp: null, // subject to coinsurance
      specialist: null,
      urgent: null,
      er: 100, // ER in-network benefit applies
      inpatient: null,
      outpatient: null,
      therapy_copay: null,
      chiro_copay: null,
      xray: null,
      lab: null,
      imaging: null
    }
  },
  oc1: {
    name: 'Open Choice 1',
    in: {
      deductible_ind: 0,
      deductible_fam: 0,
      oop_max_ind: 6600,
      oop_max_fam: 13200,
      pcp: 10,
      specialist: 20,
      urgent: 28,
      er: 100,
      inpatient: 75, // copay per day
      inpatient_per_day: true,
      inpatient_max_copay: 375, // max per admission
      outpatient: 75,
      therapy_copay: 15, // 1-30: 15, 31-60: 25
      therapy_limit: 60,
      chiro_copay: 20,
      chiro_limit: 30,
      xray: 20,
      lab: 0,
      imaging: 20
    },
    out: {
      deductible_ind: 600,
      deductible_fam: 1200,
      oop_max_ind: 7500,
      oop_max_fam: 15000,
      coinsurance: 0.30, // 30% coinsurance
      pcp: null,
      specialist: null,
      urgent: null,
      er: 100,
      inpatient: null,
      outpatient: null,
      therapy_copay: null,
      chiro_copay: null,
      xray: null,
      lab: null,
      imaging: null
    }
  },
  oc2: {
    name: 'Open Choice 2',
    in: {
      deductible_ind: 0,
      deductible_fam: 0,
      oop_max_ind: 6600,
      oop_max_fam: 13200,
      pcp: 20,
      specialist: 40,
      urgent: 28,
      er: 100,
      inpatient: 350,
      inpatient_per_day: false,
      outpatient: 200,
      therapy_copay: 20, // 1-30: 20, 31-60: 40
      therapy_limit: 60,
      chiro_copay: 40,
      chiro_limit: 30,
      xray: 40,
      lab: 0,
      imaging: 20
    },
    out: {
      deductible_ind: 1000,
      deductible_fam: 3000,
      oop_max_ind: 7500,
      oop_max_fam: 15000,
      coinsurance: 0.30,
      pcp: null,
      specialist: null,
      urgent: null,
      er: 100,
      inpatient: null,
      outpatient: null,
      therapy_copay: null,
      chiro_copay: null,
      xray: null,
      lab: null,
      imaging: null
    }
  },
  oc3: {
    name: 'Open Choice 3',
    in: {
      deductible_ind: 1100,
      deductible_fam: 2200,
      oop_max_ind: 6600,
      oop_max_fam: 13200,
      pcp: 25, // covered before deductible
      specialist: 50, // covered before deductible
      urgent: 50, // covered before deductible
      er: 100, // covered before deductible
      inpatient: 300, // covered before deductible
      inpatient_per_day: false,
      outpatient: 200, // covered before deductible
      therapy_copay: 25, // 1-30: 25, 31-60: 50
      therapy_limit: 60,
      chiro_copay: 50,
      chiro_limit: 100,
      xray: 0.0, // 0% coinsurance after deductible (subject to deductible)
      lab: 0.0, // 0% coinsurance after deductible (subject to deductible)
      imaging: 0.0 // 0% coinsurance after deductible (subject to deductible)
    },
    out: {
      deductible_ind: 1100,
      deductible_fam: 3300,
      oop_max_ind: 10000,
      oop_max_fam: 30000,
      coinsurance: 0.50,
      pcp: null,
      specialist: null,
      urgent: null,
      er: 100,
      inpatient: null,
      outpatient: null,
      therapy_copay: null,
      chiro_copay: null,
      xray: null,
      lab: null,
      imaging: null
    }
  }
};

// DOM Elements
const selectGroup = document.getElementById('bargaining-group');
const selectTier = document.getElementById('coverage-tier');
const toggleNetwork = document.getElementById('toggle-network');
const networkStatusText = document.getElementById('network-status-text');
const toggleVision = document.getElementById('toggle-vision');
const toggleDental = document.getElementById('toggle-dental');
const toggleHours = document.getElementById('toggle-hours');

// Check plan availability and generate premium cards
function updatePremiumDisplay() {
  const group = selectGroup.value;
  const tier = selectTier.value;
  const container = document.getElementById('premium-cards-container');
  container.innerHTML = '';

  const GROUP_FORM_MAP = {
    cbea: 'docs/cbea-form.pdf',
    act93: 'docs/act93-form.pdf',
    confidential: 'docs/confidential-form.pdf',
    support_12: 'docs/support-form.pdf',
    support_10: 'docs/support-form.pdf',
    transportation_12: 'docs/transportation12-form.pdf',
    transportation_10: 'docs/transportation10-form.pdf'
  };
  const formPath = GROUP_FORM_MAP[group];
  
  // Handle Dental checkbox availability conditionally
  const isSupport = group === 'support_12' || group === 'support_10';
  if (isSupport) {
    toggleDental.checked = false;
    toggleDental.disabled = true;
    toggleDental.parentElement.style.opacity = '0.5';
    const labelSpan = toggleDental.parentElement.querySelector('span:last-child');
    if (labelSpan) labelSpan.textContent = 'Dental (Not Available for Support)';
  } else {
    toggleDental.disabled = false;
    toggleDental.parentElement.style.opacity = '1';
    const labelSpan = toggleDental.parentElement.querySelector('span:last-child');
    if (labelSpan) labelSpan.textContent = 'Add Voluntary Dental';
  }
  
  // Update network status text
  if (toggleNetwork.checked) {
    networkStatusText.textContent = "Out-of-Network Care (Higher Cost)";
  } else {
    networkStatusText.textContent = "In-Network Care (Standard)";
  }

  // Show/Hide Transportation Hours restriction checkbox conditionally
  const hoursToggleContainer = document.getElementById('group-hours-restriction');
  if (group === 'transportation_10') {
    if (hoursToggleContainer) hoursToggleContainer.style.display = 'block';
  } else {
    if (hoursToggleContainer) hoursToggleContainer.style.display = 'none';
    const toggleHours = document.getElementById('toggle-hours');
    if (toggleHours) toggleHours.checked = false; // Reset if switched away
  }

  Object.keys(PLAN_BENEFITS).forEach(planId => {
    const plan = PLAN_BENEFITS[planId];
    
    // Check if under 1080 hours rule applies for transportation_10
    const toggleHours = document.getElementById('toggle-hours');
    const isUnder1080 = group === 'transportation_10' && toggleHours && toggleHours.checked;
    
    let baseRates = premiumRates[group] ? premiumRates[group][planId] : null;
    let sharePct = sharePcts[group] ? sharePcts[group][planId] : null;
    
    if (isUnder1080) {
      baseRates = transUnder1080Rates[planId];
      if (planId === 'oa') {
        sharePct = null; // OA not available under 1080 hours
      } else if (planId === 'oc3') {
        sharePct = 100; // 100% share for under 1080 rate
      } else {
        sharePct = null;
      }
    }
    
    const isEliminated = sharePct === null || !baseRates || baseRates[tier] === 0;
    
    let cardHTML = '';
    
    if (isEliminated) {
      let eliminatedLabel = 'Unavailable';
      let eliminatedReason = 'under contract';
      if (isUnder1080 && planId === 'oa') {
        eliminatedLabel = 'Not Eligible';
        eliminatedReason = 'Requires >= 1080 hrs';
      }
      cardHTML = `
        <div class="card plan-card plan-${planId} disabled">
          <div class="plan-header">
            <span class="plan-name">${plan.name}</span>
            <span class="plan-status-tag status-eliminated">${eliminatedLabel}</span>
          </div>
          <div class="price-box">
            <div class="price-amount" style="font-size: 1.5rem; color: var(--text-muted);">${eliminatedLabel}</div>
            <div class="price-period">${eliminatedReason}</div>
          </div>
          <div class="plan-quick-details">
            <div>Deductible: N/A</div>
            <div>OOP Max: N/A</div>
          </div>
        </div>
      `;
    } else {
      const baseMonthly = baseRates[tier];
      const empMonthly = (baseMonthly * sharePct) / 100;
      const empAnnual = empMonthly * 12;
      
      const isVision = toggleVision.checked;
      const isDental = toggleDental.checked;
      const visionCost = isVision ? visionRates[tier] : 0;
      const dentalCost = isDental ? dentalRates[group][tier] : 0;
      
      const totalEmpMonthly = empMonthly + visionCost + dentalCost;
      const totalEmpAnnual = empAnnual + (visionCost * 12) + (dentalCost * 12);
      
      const pays = PAY_PERIODS[group];
      const paycheckDeduction = (totalEmpAnnual) / pays;
      
      const deductibleStr = planId === 'oc3' 
        ? (tier === 'individual' ? '$1,100' : '$2,200') 
        : '$0';
        
      const oopStr = tier === 'individual' ? '$6,600' : '$13,200';
      
      // Determine Dental/Vision Coverage status display notes
      const isSupportGroup = group === 'support_12' || group === 'support_10';
      let dentalStatusHTML = '';
      if (isSupportGroup) {
        dentalStatusHTML = `<div style="color: var(--text-muted); font-style: italic;">✗ Dental: Not Available</div>`;
      } else {
        if (isDental) {
          dentalStatusHTML = `<div style="color: var(--accent-teal); font-weight: 500;">✓ Dental: Voluntary Added (+$${dentalCost.toFixed(2)}/mo)</div>`;
        } else {
          dentalStatusHTML = `<div style="color: var(--text-muted); font-style: italic;">✗ Dental: Not Selected</div>`;
        }
      }

      let visionStatusHTML = '';
      if (isVision) {
        visionStatusHTML = `<div style="color: var(--accent-teal); font-weight: 500;">✓ Vision: Voluntary Added (+$${visionCost.toFixed(2)}/mo)</div>`;
      } else {
        visionStatusHTML = `<div style="color: var(--text-muted); font-style: italic;">✗ Vision (Eye Med): Not Selected</div>`;
      }
      
      let summaryHTML = '';
      if (planId === 'oa') {
        summaryHTML = `
          <div class="plan-summary-box" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-blue);">
            <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); margin-bottom: 0.15rem;">🚀 "Best Bang for Your Buck"</div>
            <div style="font-size: 0.775rem; line-height: 1.35; color: var(--text-secondary);">
              More upfront premium than Choice 3, but the most predictable out-of-pocket costs with $0 deductible.
            </div>
          </div>
        `;
      } else if (planId === 'oc1') {
        summaryHTML = `
          <div class="plan-summary-box" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-purple);">
            <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); margin-bottom: 0.15rem;">✨ "The Premium Classic"</div>
            <div style="font-size: 0.775rem; line-height: 1.35; color: var(--text-secondary);">
              Offered to select groups. Higher premiums offset by low copays and low out-of-pocket costs with no deductible.
            </div>
          </div>
        `;
      } else if (planId === 'oc2') {
        summaryHTML = `
          <div class="plan-summary-box" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-coral);">
            <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); margin-bottom: 0.15rem;">🚗 "The Mercedes Plan"</div>
            <div style="font-size: 0.775rem; line-height: 1.35; color: var(--text-secondary);">
              Extremely comprehensive coverage with moderate premiums and flat copays—but is it truly needed for your family?
            </div>
          </div>
        `;
      } else if (planId === 'oc3') {
        summaryHTML = `
          <div class="plan-summary-box" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-teal);">
            <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); margin-bottom: 0.15rem;">🛡️ "The Saver Plan"</div>
            <div style="font-size: 0.775rem; line-height: 1.35; color: var(--text-secondary);">
              Lowest monthly premiums (often $0). In exchange, you pay 100% of diagnostics out-of-pocket until you meet the deductible.
            </div>
          </div>
        `;
      }

      cardHTML = `
        <div class="card plan-card plan-${planId}" id="card-plan-${planId}">
          <div class="plan-header">
            <span class="plan-name">${plan.name}</span>
            <span class="plan-status-tag" id="tag-${planId}" style="display: none;">Best Value</span>
          </div>
          <div class="price-box">
            <div class="price-amount" id="premium-${planId}">$${totalEmpMonthly.toFixed(2)}</div>
            <div class="price-period">per month (${sharePct}% share)</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-blue); margin-top: 0.35rem;">
              Deduction: $${paycheckDeduction.toFixed(2)} / paycheck (${pays} pays/yr)
            </div>
          </div>
          ${summaryHTML}
          <div class="plan-quick-details">
            <div>Base Plan Cost: $${baseMonthly.toFixed(2)}/mo</div>
            <div>Annual Employee Share: $${totalEmpAnnual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</div>
            <div>In-Net Deductible: ${deductibleStr}</div>
            <div>In-Net OOP Max: ${oopStr}</div>
            <div style="margin-top: 0.5rem; border-top: 1px dashed rgba(15, 23, 42, 0.08); padding-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.825rem;">
              ${dentalStatusHTML}
              ${visionStatusHTML}
            </div>
          </div>
        </div>
      `;
    }
    
    container.innerHTML += cardHTML;
  });
}

// 9. Interactive Benefits Explorer & Slider Reset
let activeBenefit = 'pcp';

function renderExplorer() {
  const group = selectGroup.value;
  const container = document.getElementById('explorer-cards-container');
  if (!container) return;
  container.innerHTML = '';
  
  const selectedBtn = document.querySelector(`[data-benefit="${activeBenefit}"]`);
  if (selectedBtn) {
    document.querySelectorAll('[data-benefit]').forEach(b => b.classList.remove('active'));
    selectedBtn.classList.add('active');
  }
  
  const benefitMap = {
    pcp: {
      title: "🩺 Primary Care (PCP) Visit",
      desc: "Visits to your family doctor, pediatrician, or general practitioner.",
      note: "No deductible applies in-network for any plan. You just pay the flat copay."
    },
    specialist: {
      title: "🥼 Specialist Visit",
      desc: "Visits to medical specialists (e.g. cardiologists, dermatologists, orthopedists).",
      note: "No referral is required to see a specialist. No deductible applies in-network."
    },
    preventive: {
      title: "🛡️ Preventive Care & Wellness",
      desc: "Routine physicals, annual checkups, immunizations, and standard health screenings.",
      note: "100% covered in-network ($0 cost) across all plans as mandated by the ACA."
    },
    inpatient: {
      title: "🏥 Inpatient Hospital Stay",
      desc: "Overnight hospital admissions for medical treatments, surgeries, or childbirth.",
      note: "For OC1: $75 copay per day (max $375 per admission). Others charge a flat copay per stay."
    },
    outpatient: {
      title: "🔪 Outpatient Surgery",
      desc: "Surgeries performed at ambulatory surgery centers or hospital outpatient clinics.",
      note: "Subject to a flat copay. You do not need to meet the deductible first."
    },
    er: {
      title: "🚨 Emergency Room Visit",
      desc: "Emergency department treatment for acute or life-threatening conditions.",
      note: "The copay is waived immediately if you are admitted to the hospital directly from the ER."
    },
    urgent: {
      title: "⚡ Urgent Care Visit",
      desc: "Visits to walk-in clinics for minor injuries or illnesses requiring prompt care.",
      note: "A flat copay applies. Deductible is waived for in-network urgent care visits."
    },
    therapy: {
      title: "💪 Physical / Occupational / Speech Therapy",
      desc: "Outpatient rehabilitative therapy visits to restore or improve bodily functions.",
      note: "Open Access is 100% covered. Other plans have visit tiers (Copay increases after visit 30)."
    },
    chiro: {
      title: "🦴 Chiropractic Care",
      desc: "Spinal adjustments and manual therapy sessions.",
      note: "Subject to copays or coinsurance depending on plan. Limit of visits applies per the SPD."
    },
    xray: {
      title: "🩻 Diagnostic X-Ray",
      desc: "Standard diagnostic imaging such as chest X-rays or bone scans.",
      note: "100% covered for Open Access & Open Choice 3. Others require a small flat copay."
    },
    lab: {
      title: "🧪 Laboratory Work",
      desc: "Blood tests, pathology screenings, urinalysis, etc.",
      note: "Always 100% covered in-network ($0 cost) for all four plans."
    },
    imaging: {
      title: "🌀 Diagnostic Complex Imaging",
      desc: "Advanced diagnostic imaging including MRI, CT, and PET scans.",
      note: "100% covered for Open Access & Open Choice 3. Others charge a $20 copay."
    }
  };

  const selectedBenefit = benefitMap[activeBenefit];
  
  // Update Title & Description Banner
  const detailsEl = document.getElementById('explorer-details-container');
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="background: rgba(29, 78, 216, 0.03); border: 1px solid rgba(29, 78, 216, 0.1); border-left: 4px solid var(--accent-blue); padding: 0.85rem 1rem; border-radius: var(--radius-sm);">
        <h4 style="color: var(--accent-indigo); font-weight: 700; margin: 0 0 0.15rem 0; font-size: 1.05rem;">${selectedBenefit.title}</h4>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${selectedBenefit.desc}</p>
      </div>
    `;
  }
  
  Object.keys(PLAN_BENEFITS).forEach(planId => {
    const plan = PLAN_BENEFITS[planId];
    const sharePct = sharePcts[group] ? sharePcts[group][planId] : null;
    const isEliminated = sharePct === null;
    
    if (isEliminated) return; // Hide card for plans not offered to this group
    
    let inText = '';
    const inVal = plan.in[activeBenefit];
    
    if (activeBenefit === 'preventive') {
      inText = '100% Covered ($0)';
    } else if (activeBenefit === 'lab') {
      if (planId === 'oc3') inText = '100% Covered;<br>after deductible';
      else inText = '100% Covered ($0)';
    } else if (activeBenefit === 'xray' || activeBenefit === 'imaging') {
      if (planId === 'oc3') inText = '100% Covered;<br>after deductible';
      else if (inVal === 0) inText = '100% Covered ($0)';
      else inText = `$${inVal} Copay`;
    } else if (activeBenefit === 'therapy') {
      if (planId === 'oa') inText = '100% Covered ($0)';
      else if (planId === 'oc1') inText = '$15 Copay (visits 1-30)<br>$25 Copay (visits 31-60)';
      else if (planId === 'oc2') inText = '$20 Copay (visits 1-30)<br>$40 Copay (visits 31-60)';
      else if (planId === 'oc3') inText = '$25 Copay (visits 1-30)<br>$50 Copay (visits 31-60)';
    } else if (activeBenefit === 'inpatient') {
      if (planId === 'oc1') inText = '$75 / day<br>(max $375 per stay)';
      else inText = `$${inVal} Copay per stay`;
    } else if (activeBenefit === 'er') {
      inText = `$${inVal} Copay<br>(waived if admitted)`;
    } else if (inVal === 0) {
      inText = '100% Covered ($0)';
    } else if (inVal !== null) {
      inText = `$${inVal} Copay`;
    } else {
      inText = 'N/A';
    }
    
    let outText = '';
    const coinsurancePct = Math.round((1 - plan.out.coinsurance) * 100);
    if (activeBenefit === 'preventive') {
      if (planId === 'oa' || planId === 'oc3') outText = '50%; no deductible';
      else outText = '70%; no deductible';
    } else {
      if (planId === 'oa' || planId === 'oc3') outText = '50%; after deductible';
      else outText = '70%; after deductible';
    }
    
    const cardEl = document.createElement('div');
    cardEl.className = `card plan-card plan-${planId}`;
    cardEl.style.padding = '1rem';
    cardEl.style.border = `1px solid var(--border-color)`;
    cardEl.style.display = 'flex';
    cardEl.style.flexDirection = 'column';
    cardEl.style.justifyContent = 'space-between';
    cardEl.style.boxShadow = 'var(--shadow-sm)';
    
    cardEl.innerHTML = `
      <div>
        <div style="font-weight: 700; color: var(--text-primary); border-bottom: 2px solid rgba(15,23,42,0.04); padding-bottom: 0.35rem; margin-bottom: 0.6rem; font-size: 0.95rem;">
          ${plan.name}
        </div>
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">In-Network Care</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--accent-indigo); margin-top: 0.1rem; line-height: 1.2;">
            ${inText}
          </div>
        </div>
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Out-of-Network</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.1rem;">
            ${outText}
          </div>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(15,23,42,0.02); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border-left: 2.5px solid var(--accent-blue); line-height: 1.3; margin-top: 0.4rem;">
        ${selectedBenefit.note}
      </div>
    `;
    
    container.appendChild(cardEl);
  });
}


// 10. Settings Modal Event Handlers
const settingsModal = document.getElementById('settings-modal');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnSaveRates = document.getElementById('btn-save-rates');
const btnResetRates = document.getElementById('btn-reset-rates');

function loadModalFields() {
  const group = selectGroup.value;
  const groupLabel = selectGroup.options[selectGroup.selectedIndex].text;
  const titleEl = document.getElementById('modal-group-title');
  if (titleEl) {
    titleEl.textContent = `1. Base Monthly Premium Equivalency Rates (${groupLabel})`;
  }

  // Base rates for active group
  document.getElementById('rate-oa-ind').value = premiumRates[group].oa.individual;
  document.getElementById('rate-oa-ind1').value = premiumRates[group].oa.parent_child;
  document.getElementById('rate-oa-fam').value = premiumRates[group].oa.family;

  document.getElementById('rate-oc1-ind').value = premiumRates[group].oc1.individual;
  document.getElementById('rate-oc1-ind1').value = premiumRates[group].oc1.parent_child;
  document.getElementById('rate-oc1-fam').value = premiumRates[group].oc1.family;

  document.getElementById('rate-oc2-ind').value = premiumRates[group].oc2.individual;
  document.getElementById('rate-oc2-ind1').value = premiumRates[group].oc2.parent_child;
  document.getElementById('rate-oc2-fam').value = premiumRates[group].oc2.family;

  document.getElementById('rate-oc3-ind').value = premiumRates[group].oc3.individual;
  document.getElementById('rate-oc3-ind1').value = premiumRates[group].oc3.parent_child;
  document.getElementById('rate-oc3-fam').value = premiumRates[group].oc3.family;

  // Shares CBEA
  document.getElementById('pct-cbea-oa').value = sharePcts.cbea.oa;
  document.getElementById('pct-cbea-oc2').value = sharePcts.cbea.oc2;
  document.getElementById('pct-cbea-oc3').value = sharePcts.cbea.oc3;

  // Shares Support
  document.getElementById('pct-sup-oa').value = sharePcts.support_12.oa;
  document.getElementById('pct-sup-oc1').value = sharePcts.support_12.oc1;
  document.getElementById('pct-sup-oc2').value = sharePcts.support_12.oc2;
  document.getElementById('pct-sup-oc3').value = sharePcts.support_12.oc3;

  // Dental rates for active group
  document.getElementById('rate-dental-ind').value = dentalRates[group].individual;
  document.getElementById('rate-dental-ind1').value = dentalRates[group].parent_child;
  document.getElementById('rate-dental-fam').value = dentalRates[group].family;

  // Vision rates
  document.getElementById('rate-vision-ind').value = visionRates.individual;
  document.getElementById('rate-vision-ind1').value = visionRates.parent_child;
  document.getElementById('rate-vision-fam').value = visionRates.family;
}

btnOpenSettings.addEventListener('click', () => {
  loadModalFields();
  settingsModal.classList.add('active');
});

btnCloseSettings.addEventListener('click', () => {
  settingsModal.classList.remove('active');
});

btnSaveRates.addEventListener('click', () => {
  const group = selectGroup.value;

  // Save rates for active group
  premiumRates[group].oa.individual = parseFloat(document.getElementById('rate-oa-ind').value) || 0;
  premiumRates[group].oa.parent_child = parseFloat(document.getElementById('rate-oa-ind1').value) || 0;
  premiumRates[group].oa.family = parseFloat(document.getElementById('rate-oa-fam').value) || 0;

  premiumRates[group].oc1.individual = parseFloat(document.getElementById('rate-oc1-ind').value) || 0;
  premiumRates[group].oc1.parent_child = parseFloat(document.getElementById('rate-oc1-ind1').value) || 0;
  premiumRates[group].oc1.family = parseFloat(document.getElementById('rate-oc1-fam').value) || 0;

  premiumRates[group].oc2.individual = parseFloat(document.getElementById('rate-oc2-ind').value) || 0;
  premiumRates[group].oc2.parent_child = parseFloat(document.getElementById('rate-oc2-ind1').value) || 0;
  premiumRates[group].oc2.family = parseFloat(document.getElementById('rate-oc2-fam').value) || 0;

  premiumRates[group].oc3.individual = parseFloat(document.getElementById('rate-oc3-ind').value) || 0;
  premiumRates[group].oc3.parent_child = parseFloat(document.getElementById('rate-oc3-ind1').value) || 0;
  premiumRates[group].oc3.family = parseFloat(document.getElementById('rate-oc3-fam').value) || 0;

  // Save shares
  sharePcts.cbea.oa = parseFloat(document.getElementById('pct-cbea-oa').value) || 0;
  sharePcts.cbea.oc2 = parseFloat(document.getElementById('pct-cbea-oc2').value) || 0;
  sharePcts.cbea.oc3 = parseFloat(document.getElementById('pct-cbea-oc3').value) || 0;

  const supOA = parseFloat(document.getElementById('pct-sup-oa').value) || 0;
  const supOC1 = parseFloat(document.getElementById('pct-sup-oc1').value) || 0;
  const supOC2 = parseFloat(document.getElementById('pct-sup-oc2').value) || 0;
  const supOC3 = parseFloat(document.getElementById('pct-sup-oc3').value) || 0;

  sharePcts.support_12.oa = supOA;
  sharePcts.support_12.oc1 = supOC1;
  sharePcts.support_12.oc2 = supOC2;
  sharePcts.support_12.oc3 = supOC3;

  sharePcts.support_10.oa = supOA;
  sharePcts.support_10.oc1 = supOC1;
  sharePcts.support_10.oc2 = supOC2;
  sharePcts.support_10.oc3 = supOC3;

  // Save dental/vision for active group
  dentalRates[group].individual = parseFloat(document.getElementById('rate-dental-ind').value) || 0;
  dentalRates[group].parent_child = parseFloat(document.getElementById('rate-dental-ind1').value) || 0;
  dentalRates[group].family = parseFloat(document.getElementById('rate-dental-fam').value) || 0;

  visionRates.individual = parseFloat(document.getElementById('rate-vision-ind').value) || 0;
  visionRates.parent_child = parseFloat(document.getElementById('rate-vision-ind1').value) || 0;
  visionRates.family = parseFloat(document.getElementById('rate-vision-fam').value) || 0;

  // Save to local storage
  localStorage.setItem('cbsd_premium_rates', JSON.stringify(premiumRates));
  localStorage.setItem('cbsd_share_pcts', JSON.stringify(sharePcts));
  localStorage.setItem('cbsd_vision_rates', JSON.stringify(visionRates));
  localStorage.setItem('cbsd_dental_rates', JSON.stringify(dentalRates));

  settingsModal.classList.remove('active');
  updatePremiumDisplay();
  renderExplorer();
});

btnResetRates.addEventListener('click', () => {
  premiumRates = JSON.parse(JSON.stringify(DEFAULT_PREMIUM_RATES));
  sharePcts = JSON.parse(JSON.stringify(DEFAULT_SHARE_PCTS));
  visionRates = JSON.parse(JSON.stringify(DEFAULT_VISION_RATES));
  dentalRates = JSON.parse(JSON.stringify(DEFAULT_DENTAL_RATES));
  transUnder1080Rates = JSON.parse(JSON.stringify(DEFAULT_TRANS_UNDER_1080_RATES));
  loadModalFields();
});

// 11. Page Event Listeners
selectGroup.addEventListener('change', () => {
  // Update Open Choice 1 visibility based on selection
  const group = selectGroup.value;
  const thOC1 = document.getElementById('th-oc1');
  const cellOC1mo = document.getElementById('cell-oc1-prem-mo');
  const cellOC1yr = document.getElementById('cell-oc1-prem-yr');
  const cellOC1med = document.getElementById('cell-oc1-oop-med');
  const cellOC1rx = document.getElementById('cell-oc1-oop-rx');
  const cellOC1tot = document.getElementById('cell-oc1-total');
  const chartLblOC1 = document.getElementById('chart-lbl-oc1');

  const sharePct = sharePcts[group]['oc1'];
  const isEliminated = sharePct === null;

  if (isEliminated) {
    if (thOC1) thOC1.style.display = 'none';
    if (cellOC1mo) cellOC1mo.style.display = 'none';
    if (cellOC1yr) cellOC1yr.style.display = 'none';
    if (cellOC1med) cellOC1med.style.display = 'none';
    if (cellOC1rx) cellOC1rx.style.display = 'none';
    if (cellOC1tot) cellOC1tot.style.display = 'none';
    if (chartLblOC1) chartLblOC1.style.display = 'none';
  } else {
    if (thOC1) thOC1.style.display = '';
    if (cellOC1mo) cellOC1mo.style.display = '';
    if (cellOC1yr) cellOC1yr.style.display = '';
    if (cellOC1med) cellOC1med.style.display = '';
    if (cellOC1rx) cellOC1rx.style.display = '';
    if (cellOC1tot) cellOC1tot.style.display = '';
    if (chartLblOC1) chartLblOC1.style.display = '';
  }

  updatePremiumDisplay();
  renderExplorer();
});

selectTier.addEventListener('change', () => {
  updatePremiumDisplay();
  renderExplorer();
});

toggleNetwork.addEventListener('change', () => {
  updatePremiumDisplay();
  renderExplorer();
});

toggleVision.addEventListener('change', () => {
  updatePremiumDisplay();
  renderExplorer();
});

toggleDental.addEventListener('change', () => {
  updatePremiumDisplay();
  renderExplorer();
});

toggleHours.addEventListener('change', () => {
  updatePremiumDisplay();
  renderExplorer();
});


// Explorer Category Buttons Listeners
const explorerButtons = document.querySelectorAll('#explorer-buttons-container [data-benefit]');
explorerButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeBenefit = btn.dataset.benefit;
    renderExplorer();
  });
});

// 12. Run on Startup
initRates();
updatePremiumDisplay();
renderExplorer();

// Trigger a selectGroup change on start to hide OC1 by default for CBEA
selectGroup.dispatchEvent(new Event('change'));

// ==========================================
// 13. Floating Benefits AI Assistant Logic
// ==========================================

function generateBotResponse(userInput) {
  const query = userInput.toLowerCase().trim();
  
  // 1. Cheapest / Lowest Premium
  if (query.includes('cheap') || query.includes('lowest premium') || query.includes('save money') || query.includes('cheapest') || query.includes('save on premium')) {
    return `💰 <b>Lowest Premium Option: Open Choice 3</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Premium Cost:</b> Open Choice 3 has the lowest monthly employee premiums (often $0 depending on your bargaining group).</li>
      <li><b>The Catch:</b> It has an in-network deductible of <b>$1,100 (Individual) / $2,200 (Family)</b>. You must pay 100% of diagnostic costs (like standard X-Rays, Lab work, and MRIs/CT scans) out-of-pocket until you meet this deductible.</li>
      <li><b>Gist:</b> Excellent if you are healthy and want to save on monthly deductions, but carries upfront out-of-pocket risk for medical tests.</li>
    </ul>`;
  }
  
  // 2. Open Access
  if (query.includes('open access') || query.includes(' oa ') || query === 'oa') {
    return `🚀 <b>Open Access Plan ("Best Bang for Your Buck")</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Premium Cost:</b> Higher monthly premium deductions than Choice 3.</li>
      <li><b>Benefit:</b> <b>$0 Deductible</b> in-network. You only pay flat copays for visits ($15 PCP, $25 specialist) and diagnostics are 100% covered immediately ($0).</li>
      <li><b>Gist:</b> Best predictability. If you go to the doctor often or want zero financial surprise at the clinic, this plan offers the greatest value.</li>
    </ul>`;
  }

  // 3. Open Choice 2
  if (query.includes('choice 2') || query.includes('oc2') || query.includes('mercedes')) {
    return `🚗 <b>Open Choice 2 ("The Mercedes Plan")</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Premium Cost:</b> Moderate monthly premiums.</li>
      <li><b>Benefit:</b> Features flat copays for all primary services ($20 PCP, $40 specialist, $350 hospital stays) with <b>$0 in-network deductible</b>.</li>
      <li><b>Gist:</b> A very comprehensive plan with solid safety, but check if Open Access or Choice 3 might suit you better for a lower premium.</li>
    </ul>`;
  }

  // 4. Open Choice 1
  if (query.includes('choice 1') || query.includes('oc1')) {
    return `✨ <b>Open Choice 1 ("The Premium Classic")</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Availability:</b> Eliminated for Teachers (CBEA) and Transportation, but available for Act 93, Confidentials, and Support Staff.</li>
      <li><b>Benefit:</b> $0 in-network deductible, $10 PCP, $20 Specialist, and unique $75/day daily hospital copays (max $375).</li>
    </ul>`;
  }

  // 5. Deductible Comparison
  if (query.includes('deductible') || query.includes('deductibles')) {
    return `🛡️ <b>In-Network Deductible Comparison:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Open Access:</b> $0 Deductible</li>
      <li><b>Open Choice 1:</b> $0 Deductible</li>
      <li><b>Open Choice 2:</b> $0 Deductible</li>
      <li><b>Open Choice 3:</b> $1,100 (Individual) / $2,200 (Family)</li>
    </ul>
    <p style="margin-top: 0.35rem; font-size: 0.75rem; font-style: italic;">Note: For Open Choice 3, you pay 100% of diagnostic services (X-rays, labs, imaging, etc.) out-of-pocket until the deductible is met. All other plans cover diagnostics immediately with no deductible.</p>`;
  }

  // 6. X-Rays / Imaging / Diagnostics
  if (query.includes('x-ray') || query.includes('xray') || query.includes('scan') || query.includes('mri') || query.includes('imaging') || query.includes('lab') || query.includes('laboratory') || query.includes('diagnostic')) {
    return `🩻 <b>Diagnostic & Imaging Coverage:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Open Access:</b> 100% Covered ($0 cost) immediately.</li>
      <li><b>Open Choice 1:</b> $20 Copay (Labs 100% covered).</li>
      <li><b>Open Choice 2:</b> $40 Copay for X-Rays, $20 Copay for Complex Imaging/MRIs (Labs 100% covered).</li>
      <li><b>Open Choice 3:</b> <b>100% Covered ONLY after meeting the deductible</b> ($1,100 Ind / $2,200 Fam). You pay full allowed cost until then.</li>
    </ul>`;
  }

  // 7. Dental Availability
  if (query.includes('dental') || query.includes('teeth')) {
    return `🦷 <b>Voluntary Dental Plan Rules:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Support Staff:</b> Dental is <b>not offered</b> to Support Staff (10 or 12 month) under the district contract.</li>
      <li><b>Teachers (CBEA):</b> Available voluntary dental rate is $8.00 (Single), $16.00 (2-Party), or $24.00 (Family).</li>
      <li><b>Others:</b> Available for Act 93, Confidentials, and Transportation as a voluntary monthly add-on.</li>
    </ul>`;
  }

  // 8. Vision / Eye Med
  if (query.includes('vision') || query.includes('eye') || query.includes('glasses') || query.includes('eyemed')) {
    return `👁️ <b>Voluntary Vision (Eye Med) Rates:</b><br>
    Available voluntary vision is offered to all employee groups at:
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Single:</b> $5.62 / month</li>
      <li><b>2-Party:</b> $10.68 / month</li>
      <li><b>Family:</b> $15.69 / month</li>
    </ul>`;
  }

  // 9. Transportation Hours Rule
  if (query.includes('1080') || query.includes('hours') || query.includes('transportation rule') || query.includes('under 1080')) {
    return `🚌 <b>Transportation (10-Month) under 1080 Hours Rule:</b><br>
    If you are a 10-Month Transportation employee working under 1080 hours per year:
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li>You are <b>not eligible</b> for the Open Access plan.</li>
      <li>Your Open Choice 3 rates automatically scale to higher employee-share premium rates.</li>
    </ul>`;
  }

  // 10. Out of Network
  if (query.includes('network') || query.includes('out-of-network') || query.includes('oon') || query.includes('in-network')) {
    return `🏥 <b>In-Network vs. Out-of-Network:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>In-Network:</b> Standard copays and 100% covered preventative care.</li>
      <li><b>Out-of-Network:</b> Subject to deductibles first, then coinsurance splits:
        <ul>
          <li>Open Access & Choice 3: 50% member coinsurance.</li>
          <li>Choice 1 & Choice 2: 70% member coinsurance.</li>
        </ul>
      </li>
      <li><b>Warning:</b> Out-of-network providers may balance-bill you for costs exceeding the allowed amount.</li>
    </ul>`;
  }

  // Default fallback
  return `❓ <b>I can help you with specific benefits details!</b><br>
  Try asking about:<br>
  • Deductibles or Out-of-Pocket Maximums<br>
  • PCP or Specialist office visit copays<br>
  • How X-Rays or MRIs are covered<br>
  • Dental eligibility for Support Staff<br>
  • Transportation 1080 hours rule`;
}

// Floating Chat Helper Logic
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatQuickBtns = document.querySelectorAll('.chat-quick-btn');

if (chatToggleBtn && chatWindow) {
  chatToggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active') && chatInput) {
      chatInput.focus();
    }
  });
}

if (chatCloseBtn && chatWindow) {
  chatCloseBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  msgDiv.innerHTML = text;
  if (chatMessages) {
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function handleUserMessage() {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text) return;
  
  appendMessage('user', text);
  chatInput.value = '';
  
  // Simulated bot typing response
  setTimeout(() => {
    const reply = generateBotResponse(text);
    appendMessage('bot', reply);
  }, 400);
}

if (chatSendBtn) {
  chatSendBtn.addEventListener('click', handleUserMessage);
}

if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserMessage();
    }
  });
}

chatQuickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const question = btn.dataset.q;
    appendMessage('user', question);
    
    setTimeout(() => {
      const reply = generateBotResponse(question);
      appendMessage('bot', reply);
    }, 300);
  });
});
