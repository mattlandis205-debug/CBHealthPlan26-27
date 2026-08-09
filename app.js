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
      chiro_limit: 30,
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
const dentalToggleText = document.getElementById('dental-toggle-text');
const toggleHours = document.getElementById('toggle-hours');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const btnOpenCompare = document.getElementById('btn-compare-matrix');
const btnCloseCompare = document.getElementById('btn-close-compare');
const compareModal = document.getElementById('compare-modal');
const compareMatrixTable = document.getElementById('compare-matrix-table');

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
      const visionCost = isVision ? visionRates[tier] : 0;
      
      const totalEmpMonthly = empMonthly + visionCost;
      const totalEmpAnnual = empAnnual + (visionCost * 12);
      
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
        dentalStatusHTML = `<div style="color: var(--text-muted); font-style: italic; padding: 0.15rem 0.35rem; border-radius: 4px; background: rgba(15, 23, 42, 0.02); width: fit-content; font-size: 0.775rem;">✗ Dental: Not Available</div>`;
      } else {
        dentalStatusHTML = `<div style="color: #166534; font-weight: 600; padding: 0.15rem 0.35rem; border-radius: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; width: fit-content; font-size: 0.775rem;">✓ Dental: Included</div>`;
      }

      let visionStatusHTML = '';
      if (isVision) {
        visionStatusHTML = `<div style="color: #166534; font-weight: 600; padding: 0.15rem 0.35rem; border-radius: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; width: fit-content; font-size: 0.775rem;">✓ Vision: +$${visionCost.toFixed(2)}/mo</div>`;
      } else {
        visionStatusHTML = `<div style="color: var(--text-muted); font-style: italic; padding: 0.15rem 0.35rem; width: fit-content; font-size: 0.775rem;">✗ Vision (Eye Med): Not Selected</div>`;
      }
      
      let summaryHTML = '';
      if (planId === 'oa') {
        summaryHTML = `
          <details class="plan-summary-box descriptor-details" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-blue); outline: none;">
            <summary style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span>🔍 Moderate Up Front, Low Later</span>
            </summary>
            <div style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.4rem; text-align: left;">
              <b>Up Front:</b> You pay a moderate, middle-of-the-road monthly premium ($492.45) and have absolutely no deductible to satisfy.<br>
              <b>Later:</b> You pay relatively low, predictable copays when you actually go to the doctor ($15 for primary care, $25 for specialists).
            </div>
          </details>
        `;
      } else if (planId === 'oc1') {
        summaryHTML = `
          <details class="plan-summary-box descriptor-details" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-purple); outline: none;">
            <summary style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span>🔍 High Up Front, Lowest Later</span>
            </summary>
            <div style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.4rem; text-align: left;">
              <span style="font-style: italic; opacity: 0.8; display: block; margin-bottom: 0.2rem;">Note: This plan is eliminated under the current teacher contract, but here is how it is structured:</span>
              <b>Up Front:</b> It requires a high monthly premium and a $1,200 family deductible that must be met first.<br>
              <b>Later:</b> Once that deductible is cleared, it offers the absolute cheapest out-of-pocket costs at the time of service ($10 for primary care, $20 for specialists).
            </div>
          </details>
        `;
      } else if (planId === 'oc2') {
        summaryHTML = `
          <details class="plan-summary-box descriptor-details" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-coral); outline: none;">
            <summary style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span>🔍 Highest Up Front, Moderate Later</span>
            </summary>
            <div style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.4rem; text-align: left;">
              <b>Up Front:</b> You pay the highest monthly premium out of your paycheck ($601.67), with no deductible to satisfy.<br>
              <b>Later:</b> Despite paying the most up front, you pay higher copays at the doctor's office than you do on the Open Access plan ($20 for primary care, $40 for specialists).
            </div>
          </details>
        `;
      } else if (planId === 'oc3') {
        summaryHTML = `
          <details class="plan-summary-box descriptor-details" style="margin: 0.75rem 0; padding: 0.65rem; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid var(--accent-teal); outline: none;">
            <summary style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span>🔍 Lowest Premium Up Front, Highest Later</span>
            </summary>
            <div style="font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); margin-top: 0.4rem; text-align: left;">
              <b>Up Front:</b> You save significantly on your monthly paycheck deduction ($254.65), but you take on a steep $3,300 family deductible that must be paid out-of-pocket before the insurance truly kicks in.<br>
              <b>Later:</b> Even after you clear that high deductible, your costs at the time of service remain the highest, as you are responsible for paying 50% coinsurance on most medical bills.
            </div>
          </details>
        `;
      }

      // Risk Factor calculations
      let riskHTML = '';
      if (planId !== 'oc1') {
        const oopMaxVal = planId === 'oc2' 
          ? (tier === 'individual' ? 7500 : 15000)
          : (tier === 'individual' ? 6600 : 13200);
        
        const worstCaseHitVal = empAnnual + oopMaxVal;
        
        let rankStr = '';
        let rankClass = '';
        let bottomLineText = '';
        
        if (planId === 'oc3') {
          rankStr = 'Rank 1: Lowest Total Financial Risk';
          rankClass = '#166534';
          bottomLineText = `<b>The Bottom Line:</b> Because your monthly paycheck deductions are so low, your total financial exposure in a catastrophic medical year is actually the lowest of all three plans. You will hit your out-of-pocket ceiling much faster due to the upfront deductible and 50% coinsurance, but your combined bill caps out at the lowest overall number.`;
        } else if (planId === 'oa') {
          rankStr = 'Rank 2: Moderate Total Financial Risk';
          rankClass = '#b45309';
          bottomLineText = `<b>The Bottom Line:</b> This plan hits the middle spot. It shares the exact same $13,200 medical cap as Open Choice 3, but because you are paying roughly $2,850 more in fixed premium costs over the year, your worst-case total is higher by that exact amount.`;
        } else if (planId === 'oc2') {
          rankStr = 'Rank 3: Highest Total Financial Risk';
          rankClass = '#991b1b';
          bottomLineText = `<b>The Bottom Line:</b> This is the most expensive worst-case scenario by a wide margin. You are hit from both sides: you pay the highest guaranteed premium out of your paycheck and you have a higher legal cap on what the hospital can bill you before 100% coverage kicks in. In a terrible medical year, this plan costs a family $5,964.24 more than Open Choice 3.`;
        }
        
        riskHTML = `
          <details class="risk-details" style="margin-top: 0.75rem; border-top: 1px dashed rgba(15, 23, 42, 0.12); padding-top: 0.6rem;">
            <summary style="font-weight: 600; color: var(--accent-indigo); cursor: pointer; font-size: 0.775rem; outline: none; display: flex; align-items: center; justify-content: space-between; user-select: none;">
              <span>⚠️ Worst-Case Scenario Risk</span>
              <span style="font-size: 0.7rem; opacity: 0.75; font-weight: 700; color: ${rankClass}; text-transform: uppercase;">${rankStr.split(':')[0]}</span>
            </summary>
            <div style="margin-top: 0.5rem; background: rgba(15, 23, 42, 0.02); padding: 0.5rem; border-radius: 4px; font-size: 0.75rem; line-height: 1.4; color: var(--text-secondary); text-align: left;">
              <div style="font-weight: 700; color: ${rankClass}; margin-bottom: 0.25rem; font-size: 0.775rem;">${rankStr}</div>
              <table style="width: 100%; font-size: 0.725rem; border-collapse: collapse; margin-bottom: 0.4rem;">
                <tr style="border-bottom: 1px solid rgba(15, 23, 42, 0.05);">
                  <td style="padding: 0.2rem 0; font-weight: 600; text-align: left;">Annual Premium Cost</td>
                  <td style="padding: 0.2rem 0; text-align: right; color: var(--text-primary); font-weight: 500;">$${empAnnual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(15, 23, 42, 0.05);">
                  <td style="padding: 0.2rem 0; font-weight: 600; text-align: left;">Out-of-Pocket Max</td>
                  <td style="padding: 0.2rem 0; text-align: right; color: var(--text-primary); font-weight: 500;">$${oopMaxVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr style="font-weight: 700; color: ${rankClass};">
                  <td style="padding: 0.25rem 0; text-align: left;">Total Worst-Case Hit</td>
                  <td style="padding: 0.25rem 0; text-align: right;">$${worstCaseHitVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </table>
              <div style="font-size: 0.725rem; line-height: 1.35; color: var(--text-secondary); border-top: 1px solid rgba(15, 23, 42, 0.05); padding-top: 0.4rem;">
                ${bottomLineText}
              </div>
            </div>
          </details>
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
          ${riskHTML}
        </div>
      `;
    }
    
    container.innerHTML += cardHTML;
  });

  // Update SBC document links visibility based on active group
  const sbcLinkOa = document.getElementById('sbc-link-oa');
  const sbcLinkOc1 = document.getElementById('sbc-link-oc1');
  const sbcLinkOc2 = document.getElementById('sbc-link-oc2');
  const sbcLinkOc3 = document.getElementById('sbc-link-oc3');

  if (sbcLinkOa) sbcLinkOa.style.display = sharePcts[group].oa === null ? 'none' : '';
  if (sbcLinkOc1) sbcLinkOc1.style.display = sharePcts[group].oc1 === null ? 'none' : '';
  if (sbcLinkOc2) sbcLinkOc2.style.display = sharePcts[group].oc2 === null ? 'none' : '';
  if (sbcLinkOc3) sbcLinkOc3.style.display = sharePcts[group].oc3 === null ? 'none' : '';
  
  if (typeof calculateSimulator === 'function') {
    calculateSimulator();
  }
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
      note: "No deductible applies in-network for any plan. You just pay the flat copay. General medical telemedicine services via Teladoc are available on all plans (consult fee/copay applies)."
    },
    specialist: {
      title: "🥼 Specialist Visit",
      desc: "Visits to medical specialists (e.g. cardiologists, dermatologists, orthopedists).",
      note: "No referral is required to see a specialist. No deductible applies in-network. Behavioral health telemedicine services via Teladoc are available."
    },
    preventive: {
      title: "🛡️ Preventive Care & Wellness",
      desc: "Routine physicals, annual checkups, immunizations, and standard health screenings.",
      note: "100% covered in-network ($0 cost) across all plans as mandated by the ACA."
    },
    inpatient: {
      title: "🏥 Inpatient Hospital Stay",
      desc: "Overnight hospital admissions for medical treatments, surgeries, or childbirth.",
      note: "For OC1: $75 copay per day (max $375 per admission). Others charge a flat copay per stay. Preauthorization is required for out-of-network admissions."
    },
    birth: {
      title: "👶 Giving Birth (Maternity/Childbirth)",
      desc: "Inpatient hospital stay and delivery services for childbirth.",
      note: "Covers the hospital room, labor & delivery services for both mother and child. On Choice 3, the deductible applies first (which typically matches the family tier once the child is born)."
    },
    outpatient: {
      title: "🔪 Outpatient Surgery",
      desc: "Surgeries performed at ambulatory surgery centers or hospital outpatient clinics.",
      note: "Subject to a flat copay or coinsurance. You do not need to meet the deductible first."
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
      note: "Open Access: 100% Covered ($0 copay), limited to 60 visits per incident. Other plans: Tiered copays (e.g. visits 1-30 vs 31-60), limited to 60 visits combined per benefit period."
    },
    chiro: {
      title: "🦴 Chiropractic Care",
      desc: "Spinal adjustments and manual therapy sessions.",
      note: "Open Access: 100% Covered ($0 copay), limited to 100 visits per benefit period. Other plans: Flat copays ($20 for OC1, $40 for OC2, $50 for OC3), limited to 30 visits per benefit period."
    },
    acupuncture: {
      title: "⚕️ Acupuncture Services",
      desc: "Acupuncture treatments performed by licensed acupuncturists for pain relief or therapeutic care.",
      note: "Covered across all four plans in-network. Subject to the Specialist copay."
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
    const benefitKey = activeBenefit === 'birth' ? 'inpatient' : (activeBenefit === 'chiro' ? 'chiro_copay' : (activeBenefit === 'acupuncture' ? 'specialist' : activeBenefit));
    const inVal = plan.in[benefitKey];
    
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
    } else if (activeBenefit === 'birth') {
      if (planId === 'oc1') inText = '$75 / day<br>(max $375 per stay)';
      else if (planId === 'oc3') inText = `$${inVal} Copay per stay<br><span style="font-size: 0.725rem; opacity: 0.85;">(Subject to Deductible)</span>`;
      else inText = `$${inVal} Copay per stay<br><span style="font-size: 0.725rem; opacity: 0.85;">(Deductible: $0)</span>`;
    } else if (activeBenefit === 'er') {
      inText = `$${inVal} Copay<br>(waived if admitted)`;
    } else if (activeBenefit === 'chiro') {
      const chiroVal = plan.in.chiro_copay;
      if (chiroVal === 0) inText = '100% Covered<br><span style="font-size: 0.7rem; opacity: 0.8;">(See SPD for details)</span>';
      else inText = `$${chiroVal} Copay<br><span style="font-size: 0.7rem; opacity: 0.8;">(See SPD for details)</span>`;
    } else if (activeBenefit === 'acupuncture') {
      inText = '<span style="font-size: 0.775rem; font-weight: 500; color: var(--text-secondary); line-height: 1.45; display: block;">Covered in-network; limitations may apply. Contact Luminare directly to inquire.</span>';
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

if (btnOpenSettings) {
  btnOpenSettings.addEventListener('click', () => {
    loadModalFields();
    settingsModal.classList.add('active');
  });
}

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

// 10b. Copay Cheat Sheet Modal Event Handlers
const cheatSheetModal = document.getElementById('cheat-sheet-modal');
const btnOpenCheat = document.getElementById('btn-cheat-sheet');
const btnCloseCheat = document.getElementById('btn-close-cheat');
const cheatTabsContainer = document.getElementById('cheat-tabs-container');
const cheatListContainer = document.getElementById('cheat-list-container');
const cheatSearchInput = document.getElementById('cheat-search-input');

let activeCheatPlanId = 'oa';

if (btnOpenCheat) {
  btnOpenCheat.addEventListener('click', () => {
    // Find currently active plan ID or default to Open Access 'oa'
    const firstActiveCard = document.querySelector('.plan-card');
    if (firstActiveCard) {
      const classes = firstActiveCard.className;
      if (classes.includes('plan-oc2')) activeCheatPlanId = 'oc2';
      else if (classes.includes('plan-oc3')) activeCheatPlanId = 'oc3';
      else if (classes.includes('plan-oc1')) activeCheatPlanId = 'oc1';
      else activeCheatPlanId = 'oa';
    }
    
    cheatSearchInput.value = ''; // Reset search
    openCheatSheet();
    cheatSheetModal.classList.add('active');
  });
}

if (btnCloseCheat) {
  btnCloseCheat.addEventListener('click', () => {
    cheatSheetModal.classList.remove('active');
  });
}

// Close when clicking outside modal content
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (e.target === cheatSheetModal) {
      cheatSheetModal.classList.remove('active');
    }
    if (e.target === dentalCheatSheetModal) {
      dentalCheatSheetModal.classList.remove('active');
    }
  });
}

// 10c. Dental Cheat Sheet Modal Event Handlers
const dentalCheatSheetModal = document.getElementById('dental-cheat-sheet-modal');
const btnOpenDentalCheat = document.getElementById('btn-dental-cheat');
const btnCloseDentalCheat = document.getElementById('btn-close-dental-cheat');
const dentalCheatListContainer = document.getElementById('dental-cheat-list-container');
const dentalCheatSearchInput = document.getElementById('dental-cheat-search-input');

if (btnOpenDentalCheat) {
  btnOpenDentalCheat.addEventListener('click', () => {
    dentalCheatSearchInput.value = ''; // Reset search
    renderDentalCheatList();
    dentalCheatSheetModal.classList.add('active');
  });
}

if (btnCloseDentalCheat) {
  btnCloseDentalCheat.addEventListener('click', () => {
    dentalCheatSheetModal.classList.remove('active');
  });
}

if (dentalCheatSearchInput) {
  dentalCheatSearchInput.addEventListener('input', () => {
    renderDentalCheatList();
  });
}

if (cheatSearchInput) {
  // Search input keyup listener
  cheatSearchInput.addEventListener('input', () => {
    renderCheatList();
  });
}

function openCheatSheet() {
  const group = selectGroup.value;
  
  // Build Tabs dynamically based on which plans are offered to this group
  cheatTabsContainer.innerHTML = '';
  Object.keys(PLAN_BENEFITS).forEach(planId => {
    // Check if the plan is offered (sharePct is not null)
    const sharePct = sharePcts[group][planId];
    if (sharePct !== null) {
      const btn = document.createElement('button');
      btn.className = `cheat-tab-btn ${planId === activeCheatPlanId ? 'active' : ''}`;
      btn.textContent = PLAN_BENEFITS[planId].name;
      btn.addEventListener('click', () => {
        activeCheatPlanId = planId;
        // Update tabs active state
        document.querySelectorAll('.cheat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCheatList();
      });
      cheatTabsContainer.appendChild(btn);
    }
  });
  
  // Make sure current active plan is valid, if not fall back to first tab
  const activeTabBtn = cheatTabsContainer.querySelector('.cheat-tab-btn.active');
  if (!activeTabBtn && cheatTabsContainer.firstChild) {
    cheatTabsContainer.firstChild.click();
  } else {
    renderCheatList();
  }
}

function renderCheatList() {
  const group = selectGroup.value;
  const planId = activeCheatPlanId;
  const filter = cheatSearchInput.value.toLowerCase();
  
  cheatListContainer.innerHTML = '';
  
  const planData = PLAN_BENEFITS[planId];
  if (!planData) return;
  
  // Gather copays dynamically
  const isOutOfNetwork = toggleNetwork.checked;
  const listItems = [];
  
  // List of medical benefits in a clean, consistent order
  const benefitsList = [
    { key: 'pcp', name: '🩺 Primary Care Visit (PCP)' },
    { key: 'specialist', name: '👤 Specialist Office Visit' },
    { key: 'urgent', name: '⚡ Urgent Care Visit' },
    { key: 'er', name: '🚨 Emergency Room Care' },
    { key: 'inpatient', name: '🏥 Inpatient Hospital Stay' },
    { key: 'outpatient', name: '🔪 Outpatient Surgery' },
    { key: 'therapy_copay', name: '💪 Physical / Occup / Speech Therapy' },
    { key: 'chiro_copay', name: '🦴 Chiropractic Care' },
    { key: 'xray', name: '🩻 Routine X-Ray Services' },
    { key: 'lab', name: '🧪 Routine Lab Work' },
    { key: 'imaging', name: '🌀 Complex Imaging (MRI, CT, PET)' }
  ];
  
  const networkKey = isOutOfNetwork ? 'out' : 'in';
  const benefitsObj = planData[networkKey];

  benefitsList.forEach(item => {
    let displayVal = '';
    
    if (isOutOfNetwork) {
      if (item.key === 'preventive') {
        displayVal = 'Not Covered';
      } else {
        const coinsurancePct = Math.round((1 - planData.out.coinsurance) * 100);
        displayVal = `${coinsurancePct}% Coinsurance after Deductible`;
      }
    } else {
      const rawVal = benefitsObj[item.key];
      
      if (item.key === 'preventive') {
        displayVal = '100% Covered ($0)';
      } else if (item.key === 'lab') {
        if (planId === 'oc3') displayVal = '100% Covered after Deductible';
        else displayVal = '100% Covered ($0)';
      } else if (item.key === 'xray' || item.key === 'imaging') {
        if (planId === 'oc3') displayVal = '100% Covered after Deductible';
        else if (rawVal === 0) displayVal = '100% Covered ($0)';
        else displayVal = `$${rawVal} Copay`;
      } else if (item.key === 'therapy_copay') {
        if (planId === 'oa') displayVal = '100% Covered ($0)';
        else if (planId === 'oc1') displayVal = '$15 Copay (visits 1-30), $25 Copay (visits 31-60)';
        else if (planId === 'oc2') displayVal = '$20 Copay (visits 1-30), $40 Copay (visits 31-60)';
        else if (planId === 'oc3') displayVal = '$25 Copay (visits 1-30), $50 Copay (visits 31-60)';
      } else if (item.key === 'inpatient') {
        if (planId === 'oc1') displayVal = '$75 / day (max $375 per stay)';
        else displayVal = `$${rawVal} Copay per stay`;
      } else if (item.key === 'er') {
        displayVal = `$${rawVal} Copay (waived if admitted)`;
      } else if (rawVal === 0) {
        displayVal = '100% Covered ($0)';
      } else if (rawVal !== null) {
        displayVal = `$${rawVal} Copay`;
      } else {
        displayVal = 'N/A';
      }
    }
    
    listItems.push({ name: item.name, value: displayVal, category: 'medical' });
  });
  
  // Add Rx Tiers (which are core benefits)
  // Check if group is transportation (slightly different copays)
  const isTrans = group === 'transportation_12' || group === 'transportation_10';
  const rxRetailTiers = isTrans 
    ? { t1: '$10 Copay', t2: '$20 Copay', t3: '$35 Copay', t4: '$35 Copay' }
    : { t1: '$10 Copay', t2: '$25 Copay', t3: '$40 Copay', t4: '$100 Copay' };
    
  const rxMailTiers = isTrans
    ? { t1: '$20 Copay', t2: '$40 Copay', t3: '$80 Copay' }
    : { t1: '$20 Copay', t2: '$50 Copay', t3: '$80 Copay' };
    
  listItems.push({ name: '💊 Rx Tier 1 (Generic) - 30d Retail', value: rxRetailTiers.t1, category: 'rx' });
  listItems.push({ name: '💊 Rx Tier 2 (Preferred Brand) - 30d Retail', value: rxRetailTiers.t2, category: 'rx' });
  listItems.push({ name: '💊 Rx Tier 3 (Non-Preferred) - 30d Retail', value: rxRetailTiers.t3, category: 'rx' });
  listItems.push({ name: '💊 Rx Tier 4 (Specialty) - 30d Retail', value: rxRetailTiers.t4, category: 'rx' });
  listItems.push({ name: '💊 Mail Order Rx Tier 1 (Generic) - 90d Mail', value: rxMailTiers.t1, category: 'rx' });
  listItems.push({ name: '💊 Mail Order Rx Tier 2 (Preferred Brand) - 90d Mail', value: rxMailTiers.t2, category: 'rx' });
  listItems.push({ name: '💊 Mail Order Rx Tier 3 (Non-Preferred) - 90d Mail', value: rxMailTiers.t3, category: 'rx' });
  
  // Add Dental status
  const isSupport = group === 'support_12' || group === 'support_10';
  if (isSupport) {
    listItems.push({ name: '🦷 Dental Coverage (Guardian PPO)', value: 'Not Offered for Support Group', category: 'dental' });
  } else {
    listItems.push({ name: '🦷 Dental Coverage (Guardian PPO)', value: 'Included (100% Preventive / $2k Max)', category: 'dental' });
  }
  
  // Add Vision status (EyeMed)
  listItems.push({ name: '👁️ Routine Eye Exam (EyeMed)', value: '$10 Copay ($0 at PLUS Providers)', category: 'vision' });
  listItems.push({ name: '👁️ Lenses Routine (EyeMed Single)', value: '$25 Copay', category: 'vision' });
  listItems.push({ name: '👁️ Frames Allowance (EyeMed)', value: '$130 Allowance ($180 at PLUS Providers)', category: 'vision' });
  
  // Filter items based on search input
  const filteredItems = listItems.filter(item => 
    item.name.toLowerCase().includes(filter) || 
    item.value.toLowerCase().includes(filter) ||
    item.category.toLowerCase().includes(filter)
  );
  
  if (filteredItems.length === 0) {
    cheatListContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin: 1.5rem 0;">No matching copays found. Try searching another term!</div>`;
    return;
  }
  
  // Render
  filteredItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cheat-item';
    row.innerHTML = `
      <span class="cheat-item-name">${item.name}</span>
      <span class="cheat-item-value">${item.value}</span>
    `;
    cheatListContainer.appendChild(row);
  });
}

function getBenefitName(key) {
  const names = {
    pcp: '🩺 Primary Care Visit (PCP)',
    spec: '👤 Specialist Office Visit',
    inpatient: '🏥 Inpatient Hospital Stay',
    outpatient: '🔪 Outpatient Surgery',
    er: '🚨 Emergency Room Care',
    urgent: '⚡ Urgent Care Visit',
    therapy: '💪 Physical / Occup / Speech Therapy',
    chiro: '🦴 Chiropractic Care',
    xray: '🩻 Routine X-Ray Services',
    lab: '🧪 Routine Lab Work',
    imaging: '🌀 Complex Imaging (MRI, CT, PET)'
  };
  return names[key] || key;
}

btnResetRates.addEventListener('click', () => {
  premiumRates = JSON.parse(JSON.stringify(DEFAULT_PREMIUM_RATES));
  sharePcts = JSON.parse(JSON.stringify(DEFAULT_SHARE_PCTS));
  visionRates = JSON.parse(JSON.stringify(DEFAULT_VISION_RATES));
  dentalRates = JSON.parse(JSON.stringify(DEFAULT_DENTAL_RATES));
  transUnder1080Rates = JSON.parse(JSON.stringify(DEFAULT_TRANS_UNDER_1080_RATES));
  loadModalFields();
});

// ============================================================================
// Cost Simulation and Dynamic Visuals Calculation Engine
// ============================================================================

const presets = {
  low: { pcp: 1, specialist: 0, urgent: 0, er: 0, inpatient: 0, inpatient_days: 0, outpatient: 0, therapy: 0, chiro: 0, xray: 0, lab: 2, imaging: 0, rx_generic: 0, rx_brand: 0 },
  mod: { pcp: 4, specialist: 2, urgent: 1, er: 0, inpatient: 0, inpatient_days: 0, outpatient: 0, therapy: 10, chiro: 4, xray: 2, lab: 4, imaging: 1, rx_generic: 6, rx_brand: 1 },
  high: { pcp: 10, specialist: 8, urgent: 2, er: 1, inpatient: 1, inpatient_days: 4, outpatient: 1, therapy: 30, chiro: 12, xray: 4, lab: 12, imaging: 2, rx_generic: 24, rx_brand: 6 }
};

function calculatePlanCosts(planId) {
  const group = selectGroup.value;
  const tier = selectTier.value;
  
  const sharePct = sharePcts[group] ? sharePcts[group][planId] : null;
  const baseRates = premiumRates[group] ? premiumRates[group][planId] : null;
  const hoursToggle = document.getElementById('toggle-hours');
  const isUnder1080 = group === 'transportation_10' && hoursToggle && hoursToggle.checked;
  
  if (sharePct === null || !baseRates || baseRates[tier] === 0) {
    return { fixed: 0, premiumOnly: 0, voluntaryOnly: 0, oop: 0, medicalOop: 0, rxOop: 0, total: 0, isEliminated: true };
  }
  
  let baseRate = baseRates[tier];
  let actualSharePct = sharePct;
  
  if (isUnder1080) {
    if (planId === 'oc3') {
      baseRate = transUnder1080Rates[planId][tier];
      actualSharePct = 100;
    } else {
      return { fixed: 0, premiumOnly: 0, voluntaryOnly: 0, oop: 0, medicalOop: 0, rxOop: 0, total: 0, isEliminated: true };
    }
  }
  
  const annualPremium = (baseRate * actualSharePct / 100) * 12;
  
  // Voluntary add-ons
  const isVision = toggleVision.checked;
  const visionCost = isVision ? visionRates[tier] * 12 : 0;
  
  const isSupportGroup = group === 'support_12' || group === 'support_10';
  const isDental = toggleDental && toggleDental.checked && !isSupportGroup && dentalRates[group];
  const dentalCost = isDental ? dentalRates[group][tier] * 12 : 0;
  const fixedVoluntary = visionCost + dentalCost;
  
  // Slider inputs
  const pcp = parseInt(document.getElementById('slide-pcp').value) || 0;
  const specialist = parseInt(document.getElementById('slide-specialist').value) || 0;
  const urgent = parseInt(document.getElementById('slide-urgent').value) || 0;
  const er = parseInt(document.getElementById('slide-er').value) || 0;
  const inpatient = parseInt(document.getElementById('slide-inpatient').value) || 0;
  const inpatientDays = parseInt(document.getElementById('slide-inpatient-days').value) || 0;
  const outpatient = parseInt(document.getElementById('slide-outpatient').value) || 0;
  const therapy = parseInt(document.getElementById('slide-therapy').value) || 0;
  const chiro = parseInt(document.getElementById('slide-chiro').value) || 0;
  const xray = parseInt(document.getElementById('slide-xray').value) || 0;
  const lab = parseInt(document.getElementById('slide-lab').value) || 0;
  const imaging = parseInt(document.getElementById('slide-imaging').value) || 0;
  const rxGeneric = parseInt(document.getElementById('slide-rx-generic').value) || 0;
  const rxBrand = parseInt(document.getElementById('slide-rx-brand').value) || 0;
  
  const isOutOfNetwork = toggleNetwork.checked;
  const planData = PLAN_BENEFITS[planId];
  
  let medicalOop = 0;
  let rxOop = 0;
  
  if (isOutOfNetwork) {
    const ded_ind = planData.out.deductible_ind;
    const ded_fam = planData.out.deductible_fam;
    const oop_ind = planData.out.oop_max_ind;
    const oop_fam = planData.out.oop_max_fam;
    const coinsurance_pct = planData.out.coinsurance;
    
    const active_ded = tier === 'individual' ? ded_ind : ded_fam;
    const active_oop_max = tier === 'individual' ? oop_ind : oop_fam;
    
    const allowed_pcp = pcp * 150;
    const allowed_spec = specialist * 250;
    const allowed_urg = urgent * 200;
    const allowed_inp = inpatient * 5000 + inpatientDays * 800;
    const allowed_out = outpatient * 3000;
    const allowed_ther = therapy * 150;
    const allowed_chiro = chiro * 80;
    const allowed_xray = xray * 200;
    const allowed_lab = lab * 60;
    const allowed_img = imaging * 900;
    
    const total_allowed_ex_er = allowed_pcp + allowed_spec + allowed_urg + allowed_inp + allowed_out + allowed_ther + allowed_chiro + allowed_xray + allowed_lab + allowed_img;
    
    const ded_paid = Math.min(active_ded, total_allowed_ex_er);
    const coins_basis = Math.max(0, total_allowed_ex_er - ded_paid);
    const coins_paid = coins_basis * coinsurance_pct;
    
    const er_cost = er * 100; // in-network ER copay applies to OON ER
    medicalOop = ded_paid + coins_paid + er_cost;
    
    const rxRetailTiers = (group === 'transportation_12' || group === 'transportation_10')
      ? { generic: 10, brand: 27.5 }
      : { generic: 10, brand: 32.5 };
    rxOop = (rxGeneric * rxRetailTiers.generic) + (rxBrand * rxRetailTiers.brand);
    
    const totalOop = medicalOop + rxOop;
    const cappedOop = Math.min(active_oop_max, totalOop);
    
    if (totalOop > 0) {
      medicalOop = (medicalOop / totalOop) * cappedOop;
      rxOop = (rxOop / totalOop) * cappedOop;
    }
  } else {
    // In-Network
    const active_oop_max = tier === 'individual' ? planData.in.oop_max_ind : planData.in.oop_max_fam;
    
    if (planId === 'oa') {
      medicalOop = (pcp * 15) + (specialist * 25) + (urgent * 24) + (er * 100) + (inpatient * 250) + (outpatient * 100);
      rxOop = (rxGeneric * 10) + (rxBrand * 32.5);
    } else if (planId === 'oc1') {
      const inpatient_cost = Math.min(inpatient * 375, inpatientDays * 75);
      
      const ther_first30 = Math.min(therapy, 30);
      const ther_next30 = Math.max(0, Math.min(therapy - 30, 30));
      const ther_beyond = Math.max(0, therapy - 60);
      const therapy_cost = (ther_first30 * 15) + (ther_next30 * 25) + (ther_beyond * 150);
      
      const chiro_first30 = Math.min(chiro, 30);
      const chiro_beyond = Math.max(0, chiro - 30);
      const chiro_cost = (chiro_first30 * 20) + (chiro_beyond * 80);
      
      medicalOop = (pcp * 10) + (specialist * 20) + (urgent * 28) + (er * 100) + inpatient_cost + (outpatient * 75) + therapy_cost + chiro_cost + (xray * 20) + (imaging * 20);
      rxOop = (rxGeneric * 10) + (rxBrand * 32.5);
    } else if (planId === 'oc2') {
      const ther_first30 = Math.min(therapy, 30);
      const ther_next30 = Math.max(0, Math.min(therapy - 30, 30));
      const ther_beyond = Math.max(0, therapy - 60);
      const therapy_cost = (ther_first30 * 20) + (ther_next30 * 40) + (ther_beyond * 150);
      
      const chiro_first30 = Math.min(chiro, 30);
      const chiro_beyond = Math.max(0, chiro - 30);
      const chiro_cost = (chiro_first30 * 40) + (chiro_beyond * 80);
      
      medicalOop = (pcp * 20) + (specialist * 40) + (urgent * 28) + (er * 100) + (inpatient * 350) + (outpatient * 200) + therapy_cost + chiro_cost + (xray * 40) + (imaging * 20);
      rxOop = (rxGeneric * 10) + (rxBrand * 32.5);
    } else if (planId === 'oc3') {
      const active_ded = tier === 'individual' ? 1100 : 2200;
      
      const allowed_xray = xray * 200;
      const allowed_lab = lab * 60;
      const allowed_img = imaging * 900;
      const subject_allowed = allowed_xray + allowed_lab + allowed_img;
      const ded_paid = Math.min(active_ded, subject_allowed);
      
      const ther_first30 = Math.min(therapy, 30);
      const ther_next30 = Math.max(0, Math.min(therapy - 30, 30));
      const ther_beyond = Math.max(0, therapy - 60);
      const therapy_cost = (ther_first30 * 25) + (ther_next30 * 50) + (ther_beyond * 150);
      
      const chiro_first30 = Math.min(chiro, 30);
      const chiro_beyond = Math.max(0, chiro - 30);
      const chiro_cost = (chiro_first30 * 50) + (chiro_beyond * 80);
      
      medicalOop = ded_paid + (pcp * 25) + (specialist * 50) + (urgent * 50) + (er * 100) + (inpatient * 300) + (outpatient * 200) + therapy_cost + chiro_cost;
      rxOop = (rxGeneric * 10) + (rxBrand * 32.5);
    }
    
    const totalOop = medicalOop + rxOop;
    const cappedOop = Math.min(active_oop_max, totalOop);
    
    if (totalOop > 0) {
      medicalOop = (medicalOop / totalOop) * cappedOop;
      rxOop = (rxOop / totalOop) * cappedOop;
    }
  }
  
  return {
    fixed: annualPremium + fixedVoluntary,
    premiumOnly: annualPremium,
    voluntaryOnly: fixedVoluntary,
    oop: medicalOop + rxOop,
    medicalOop: medicalOop,
    rxOop: rxOop,
    total: annualPremium + fixedVoluntary + medicalOop + rxOop,
    isEliminated: false
  };
}

function calculateSimulator() {
  const group = selectGroup.value;
  const tier = selectTier.value;
  
  const isSupportGroup = group === 'support_12' || group === 'support_10';
  if (toggleDental) {
    if (isSupportGroup) {
      toggleDental.checked = false;
      toggleDental.disabled = true;
      if (dentalToggleText) {
        dentalToggleText.textContent = "Voluntary Dental: Not Available for Support Group";
        dentalToggleText.style.color = "var(--text-muted)";
      }
    } else {
      toggleDental.disabled = false;
      if (dentalToggleText) {
        dentalToggleText.textContent = `Add Voluntary Dental (Guardian): +$${dentalRates[group] ? dentalRates[group][tier].toFixed(2) : '0.00'}/mo`;
        dentalToggleText.style.color = "var(--text-primary)";
      }
    }
  }
  
  const plans = ['oa', 'oc1', 'oc2', 'oc3'];
  const activePlans = [];
  const planCosts = {};
  
  plans.forEach(planId => {
    const costs = calculatePlanCosts(planId);
    planCosts[planId] = costs;
    
    const thCalc = document.getElementById('th-calc-' + planId);
    const cells = [
      document.getElementById('calc-' + planId + '-premium'),
      document.getElementById('calc-' + planId + '-voluntary'),
      document.getElementById('calc-' + planId + '-med-oop'),
      document.getElementById('calc-' + planId + '-rx-oop'),
      document.getElementById('calc-' + planId + '-total')
    ];
    
    if (costs.isEliminated) {
      if (thCalc) thCalc.style.display = 'none';
      cells.forEach(c => { if (c) c.style.display = 'none'; });
    } else {
      activePlans.push(planId);
      if (thCalc) thCalc.style.display = '';
      cells.forEach(c => { if (c) c.style.display = ''; });
      
      if (cells[0]) cells[0].textContent = '$' + costs.premiumOnly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      if (cells[1]) cells[1].textContent = '$' + costs.voluntaryOnly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      if (cells[2]) cells[2].textContent = '$' + costs.medicalOop.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      if (cells[3]) cells[3].textContent = '$' + costs.rxOop.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      if (cells[4]) cells[4].textContent = '$' + costs.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
  });
  
  renderCostChart(activePlans, planCosts);
  renderComparisonMatrix();
  
  const recBanner = document.getElementById('rec-banner-container');
  const recText = document.getElementById('rec-banner-text');
  
  if (activePlans.length > 0 && recBanner && recText) {
    let bestPlan = activePlans[0];
    let minCost = planCosts[bestPlan].total;
    
    activePlans.forEach(p => {
      if (planCosts[p].total < minCost) {
        minCost = planCosts[p].total;
        bestPlan = p;
      }
    });
    
    let runnerUp = null;
    let runnerUpCost = Infinity;
    activePlans.forEach(p => {
      if (p !== bestPlan && planCosts[p].total < runnerUpCost) {
        runnerUpCost = planCosts[p].total;
        runnerUp = p;
      }
    });
    
    const bestPlanName = PLAN_BENEFITS[bestPlan].name;
    const savings = runnerUp ? (runnerUpCost - minCost) : 0;
    
    recBanner.style.display = 'flex';
    
    let recommendationHTML = `Based on your simulated medical and pharmacy usage, the <b>${bestPlanName}</b> plan offers the lowest total annual cost of <b>$${minCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>.`;
    
    if (savings > 5) {
      recommendationHTML += ` Choosing this plan could save you approximately <b>$${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b> per year compared to the next best option (<b>${PLAN_BENEFITS[runnerUp].name}</b>).`;
    }
    
    if (bestPlan === 'oc3' && activePlans.includes('oa')) {
      const oaCost = planCosts.oa.total;
      const oaPremiumDiff = planCosts.oa.premiumOnly - planCosts.oc3.premiumOnly;
      recommendationHTML += `<br><span style="display: block; margin-top: 0.4rem; font-size: 0.8rem; opacity: 0.95;">💡 <b>Value Tip:</b> While Open Choice 3 is the cheapest overall, the <b>Open Access</b> plan is $${(oaCost - minCost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} more per year but offers a <b>$0 Deductible</b> in-network. If you prefer fixed copays with no upfront deductible surprises, Open Access is an excellent alternative.</span>`;
    }
    
    recText.innerHTML = recommendationHTML;
  } else if (recBanner) {
    recBanner.style.display = 'none';
  }
}

function renderCostChart(activePlans, planCosts) {
  const svg = document.getElementById('svg-cost-chart');
  if (!svg) return;
  svg.innerHTML = '';
  
  if (!activePlans || activePlans.length === 0) return;
  
  let maxCost = 0;
  activePlans.forEach(p => {
    const costs = planCosts[p];
    if (costs.total > maxCost) maxCost = costs.total;
  });
  
  if (maxCost === 0) maxCost = 5000;
  const yCeiling = Math.ceil(maxCost / 1000) * 1000;
  
  const width = 600;
  const height = 300;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 45;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  
  // Grid Lines
  const gridLinesCount = 5;
  for (let i = 0; i < gridLinesCount; i++) {
    const yVal = (yCeiling / (gridLinesCount - 1)) * i;
    const yPos = padTop + plotHeight - (yVal / yCeiling) * plotHeight;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padLeft);
    line.setAttribute('y1', yPos);
    line.setAttribute('x2', width - padRight);
    line.setAttribute('y2', yPos);
    line.setAttribute('stroke', document.body.classList.contains('dark') ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)');
    line.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(line);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', padLeft - 8);
    text.setAttribute('y', yPos + 4);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', 'var(--text-muted)');
    text.setAttribute('font-size', '10px');
    text.setAttribute('font-weight', '600');
    text.textContent = '$' + Math.round(yVal);
    svg.appendChild(text);
  }
  
  // Columns
  const barWidth = 45;
  const colWidth = plotWidth / activePlans.length;
  
  activePlans.forEach((p, idx) => {
    const costs = planCosts[p];
    const colX = padLeft + idx * colWidth + (colWidth - barWidth) / 2;
    
    const premiumHeight = (costs.fixed / yCeiling) * plotHeight;
    const oopHeight = (costs.oop / yCeiling) * plotHeight;
    
    const premiumY = padTop + plotHeight - premiumHeight;
    const oopY = premiumY - oopHeight;
    
    const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    barGroup.setAttribute('class', 'chart-bar-group');
    
    const bgBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgBar.setAttribute('x', colX);
    bgBar.setAttribute('y', padTop);
    bgBar.setAttribute('width', barWidth);
    bgBar.setAttribute('height', plotHeight);
    bgBar.setAttribute('class', 'chart-bar-bg');
    bgBar.setAttribute('rx', '4');
    barGroup.appendChild(bgBar);
    
    if (premiumHeight > 0) {
      const premBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      premBar.setAttribute('x', colX);
      premBar.setAttribute('y', premiumY);
      premBar.setAttribute('width', barWidth);
      premBar.setAttribute('height', premiumHeight);
      premBar.setAttribute('class', 'chart-bar-premium');
      premBar.setAttribute('rx', oopHeight > 0 ? '0' : '4');
      barGroup.appendChild(premBar);
    }
    
    if (oopHeight > 0) {
      const oopBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      oopBar.setAttribute('x', colX);
      oopBar.setAttribute('y', oopY);
      oopBar.setAttribute('width', barWidth);
      oopBar.setAttribute('height', oopHeight);
      oopBar.setAttribute('class', 'chart-bar-oop');
      oopBar.setAttribute('rx', '4');
      barGroup.appendChild(oopBar);
    }
    
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', colX + barWidth / 2);
    xLabel.setAttribute('y', padTop + plotHeight + 16);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('fill', 'var(--text-primary)');
    xLabel.setAttribute('font-size', '10px');
    xLabel.setAttribute('font-weight', '700');
    xLabel.textContent = PLAN_BENEFITS[p].name;
    svg.appendChild(xLabel);
    
    const xSubLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xSubLabel.setAttribute('x', colX + barWidth / 2);
    xSubLabel.setAttribute('y', padTop + plotHeight + 28);
    xSubLabel.setAttribute('text-anchor', 'middle');
    xSubLabel.setAttribute('fill', 'var(--accent-teal)');
    xSubLabel.setAttribute('font-size', '9.5px');
    xSubLabel.setAttribute('font-weight', '700');
    xSubLabel.textContent = '$' + costs.total.toLocaleString(undefined, {maximumFractionDigits: 0});
    svg.appendChild(xSubLabel);
    
    // Tooltip Overlay inside SVG
    const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltipGroup.setAttribute('opacity', '0');
    tooltipGroup.setAttribute('class', 'chart-bar-tooltip');
    tooltipGroup.style.pointerEvents = 'none';
    
    const ttWidth = 145;
    const ttHeight = 65;
    const ttX = Math.min(width - ttWidth - 5, Math.max(5, colX + barWidth/2 - ttWidth/2));
    const ttY = Math.max(5, oopY - ttHeight - 8);
    
    const ttRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ttRect.setAttribute('x', ttX);
    ttRect.setAttribute('y', ttY);
    ttRect.setAttribute('width', ttWidth);
    ttRect.setAttribute('height', ttHeight);
    ttRect.setAttribute('rx', '6');
    ttRect.setAttribute('fill', document.body.classList.contains('dark') ? '#1e293b' : '#ffffff');
    ttRect.setAttribute('stroke', 'var(--accent-blue)');
    ttRect.setAttribute('stroke-width', '1.5');
    tooltipGroup.appendChild(ttRect);
    
    const ttTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ttTitle.setAttribute('x', ttX + 8);
    ttTitle.setAttribute('y', ttY + 16);
    ttTitle.setAttribute('fill', 'var(--text-primary)');
    ttTitle.setAttribute('font-size', '10px');
    ttTitle.setAttribute('font-weight', '800');
    ttTitle.textContent = PLAN_BENEFITS[p].name;
    tooltipGroup.appendChild(ttTitle);
    
    const ttLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ttLine1.setAttribute('x', ttX + 8);
    ttLine1.setAttribute('y', ttY + 32);
    ttLine1.setAttribute('fill', 'var(--text-secondary)');
    ttLine1.setAttribute('font-size', '9px');
    ttLine1.textContent = 'Fixed Costs: $' + costs.fixed.toFixed(0) + '/yr';
    tooltipGroup.appendChild(ttLine1);
    
    const ttLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ttLine2.setAttribute('x', ttX + 8);
    ttLine2.setAttribute('y', ttY + 45);
    ttLine2.setAttribute('fill', 'var(--text-secondary)');
    ttLine2.setAttribute('font-size', '9px');
    ttLine2.textContent = 'Simulated OOP: $' + costs.oop.toFixed(0) + '/yr';
    tooltipGroup.appendChild(ttLine2);

    const ttLine3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ttLine3.setAttribute('x', ttX + 8);
    ttLine3.setAttribute('y', ttY + 58);
    ttLine3.setAttribute('fill', 'var(--accent-teal)');
    ttLine3.setAttribute('font-size', '10px');
    ttLine3.setAttribute('font-weight', '700');
    ttLine3.textContent = 'Total Cost: $' + costs.total.toFixed(0) + '/yr';
    tooltipGroup.appendChild(ttLine3);
    
    barGroup.addEventListener('mouseenter', () => {
      tooltipGroup.setAttribute('opacity', '1');
    });
    barGroup.addEventListener('mouseleave', () => {
      tooltipGroup.setAttribute('opacity', '0');
    });
    
    svg.appendChild(barGroup);
    svg.appendChild(tooltipGroup);
  });
}

function renderComparisonMatrix() {
  const group = selectGroup.value;
  const tier = selectTier.value;
  const table = document.getElementById('compare-matrix-table');
  if (!table) return;
  
  const plans = ['oa', 'oc1', 'oc2', 'oc3'];
  const activePlans = plans.filter(p => {
    const sharePct = sharePcts[group] ? sharePcts[group][p] : null;
    return sharePct !== null;
  });
  
  let html = `
    <thead>
      <tr>
        <th style="text-align: left;">Plan Features & Rules</th>
        ${activePlans.map(p => `<th>${PLAN_BENEFITS[p].name}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bargaining Group Share</td>
        ${activePlans.map(p => `<td>${sharePcts[group][p]}%</td>`).join('')}
      </tr>
      <tr>
        <td>Guaranteed Paycheck Deduction</td>
        ${activePlans.map(p => {
          const baseRate = premiumRates[group][p] ? premiumRates[group][p][tier] : 0;
          const share = sharePcts[group][p];
          const annual = (baseRate * share / 100) * 12;
          const paycheck = annual / PAY_PERIODS[group];
          return `<td>$${paycheck.toFixed(2)} <span style="font-size: 0.725rem; color: var(--text-muted); display: block;">/ paycheck</span></td>`;
        }).join('')}
      </tr>
      <tr>
        <td>In-Network Deductible</td>
        ${activePlans.map(p => `<td>${p === 'oc3' ? (tier === 'individual' ? '$1,100' : '$2,200') : '$0'}</td>`).join('')}
      </tr>
      <tr>
        <td>In-Network Out-of-Pocket Max</td>
        ${activePlans.map(p => `<td>${tier === 'individual' ? '$6,600' : '$13,200'}</td>`).join('')}
      </tr>
      <tr>
        <td>Primary Care (PCP) Visit</td>
        ${activePlans.map(p => `<td>$${PLAN_BENEFITS[p].in.pcp} Copay</td>`).join('')}
      </tr>
      <tr>
        <td>Specialist Visit</td>
        ${activePlans.map(p => `<td>$${PLAN_BENEFITS[p].in.specialist} Copay</td>`).join('')}
      </tr>
      <tr>
        <td>Urgent Care Care</td>
        ${activePlans.map(p => `<td>$${PLAN_BENEFITS[p].in.urgent} Copay</td>`).join('')}
      </tr>
      <tr>
        <td>Emergency Room Visit</td>
        ${activePlans.map(p => `<td>$${PLAN_BENEFITS[p].in.er} Copay</td>`).join('')}
      </tr>
      <tr>
        <td>Inpatient Hospital Stay</td>
        ${activePlans.map(p => {
          const plan = PLAN_BENEFITS[p];
          if (p === 'oc1') return `<td>$75 / day<br><span style="font-size: 0.7rem; color: var(--text-muted);">(max $375 per stay)</span></td>`;
          return `<td>$${plan.in.inpatient} Copay</td>`;
        }).join('')}
      </tr>
      <tr>
        <td>Outpatient Surgery</td>
        ${activePlans.map(p => `<td>$${PLAN_BENEFITS[p].in.outpatient} Copay</td>`).join('')}
      </tr>
      <tr>
        <td>Routine X-Ray Services</td>
        ${activePlans.map(p => {
          if (p === 'oc3') return `<td>100% Covered<br><span style="font-size: 0.725rem; color: var(--text-muted);">(subject to deductible)</span></td>`;
          if (PLAN_BENEFITS[p].in.xray === 0) return `<td class="comparison-check">✓ 100% Covered ($0)</td>`;
          return `<td>$${PLAN_BENEFITS[p].in.xray} Copay</td>`;
        }).join('')}
      </tr>
      <tr>
        <td>Routine Lab Work</td>
        ${activePlans.map(p => {
          if (p === 'oc3') return `<td>100% Covered<br><span style="font-size: 0.725rem; color: var(--text-muted);">(subject to deductible)</span></td>`;
          return `<td class="comparison-check">✓ 100% Covered ($0)</td>`;
        }).join('')}
      </tr>
      <tr>
        <td>Complex Imaging (MRI, CT, PET)</td>
        ${activePlans.map(p => {
          if (p === 'oc3') return `<td>100% Covered<br><span style="font-size: 0.725rem; color: var(--text-muted);">(subject to deductible)</span></td>`;
          if (PLAN_BENEFITS[p].in.imaging === 0) return `<td class="comparison-check">✓ 100% Covered ($0)</td>`;
          return `<td>$${PLAN_BENEFITS[p].in.imaging} Copay</td>`;
        }).join('')}
      </tr>
      <tr>
        <td>Out-of-Network Coinsurance</td>
        ${activePlans.map(p => `<td>${(1 - PLAN_BENEFITS[p].out.coinsurance) * 100}% Coinsurance</td>`).join('')}
      </tr>
    </tbody>
  `;
  table.innerHTML = html;
}

function initDarkMode() {
  const isDark = localStorage.getItem('cbsd_dark_mode') === 'true' || 
                 (!('cbsd_dark_mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.body.classList.add('dark');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  } else {
    document.body.classList.remove('dark');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  }
}

function setupSimulatorListeners() {
  const slidersList = [
    'pcp', 'specialist', 'urgent', 'er', 'inpatient', 'inpatient-days',
    'outpatient', 'therapy', 'chiro', 'xray', 'lab', 'imaging', 'rx-generic', 'rx-brand'
  ];
  
  slidersList.forEach(sId => {
    const slider = document.getElementById('slide-' + sId);
    const bubble = document.getElementById('val-' + sId);
    if (slider) {
      slider.addEventListener('input', () => {
        if (bubble) bubble.textContent = slider.value;
        
        // Deactivate presets since custom slider change happened
        document.querySelectorAll('.presets-grid .btn-preset').forEach(b => b.classList.remove('active'));
        calculateSimulator();
      });
    }
  });
  
  // Presets
  const pLow = document.getElementById('preset-low');
  const pMod = document.getElementById('preset-mod');
  const pHigh = document.getElementById('preset-high');
  
  const handlePresetClick = (presetKey, clickedBtn) => {
    document.querySelectorAll('.presets-grid .btn-preset').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    const vals = presets[presetKey];
    Object.keys(vals).forEach(k => {
      const inputId = k.replace('_', '-');
      const slider = document.getElementById('slide-' + inputId);
      const bubble = document.getElementById('val-' + inputId);
      if (slider) {
        slider.value = vals[k];
        if (bubble) bubble.textContent = vals[k];
      }
    });
    calculateSimulator();
  };
  
  if (pLow) pLow.addEventListener('click', () => handlePresetClick('low', pLow));
  if (pMod) pMod.addEventListener('click', () => handlePresetClick('mod', pMod));
  if (pHigh) pHigh.addEventListener('click', () => handlePresetClick('high', pHigh));
  
  if (toggleDental) {
    toggleDental.addEventListener('change', () => {
      calculateSimulator();
      updatePremiumDisplay();
    });
  }
  
  // Theme Switcher
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('cbsd_dark_mode', isDark);
      
      const sunIcon = document.querySelector('.sun-icon');
      const moonIcon = document.querySelector('.moon-icon');
      if (isDark) {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
      } else {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
      }
      // Re-render chart to pick up theme changes
      renderCostChart(['oa', 'oc1', 'oc2', 'oc3'].filter(p => sharePcts[selectGroup.value][p] !== null), {});
      calculateSimulator();
    });
  }
  
  // Comparison Modal
  if (btnOpenCompare && compareModal) {
    btnOpenCompare.addEventListener('click', () => {
      renderComparisonMatrix();
      compareModal.classList.add('active');
    });
  }
  
  if (btnCloseCompare && compareModal) {
    btnCloseCompare.addEventListener('click', () => {
      compareModal.classList.remove('active');
    });
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === compareModal) {
      compareModal.classList.remove('active');
    }
  });
}

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
initDarkMode();
setupSimulatorListeners();
updatePremiumDisplay();
renderExplorer();

// Initialize simulator to default low preset on start
const presetLowBtn = document.getElementById('preset-low');
if (presetLowBtn) {
  presetLowBtn.click();
}

// Trigger a selectGroup change on start to hide OC1 by default for CBEA
selectGroup.dispatchEvent(new Event('change'));

// ==========================================
// 13. Floating Benefits AI Assistant Logic
// ==========================================

const BOT_INTENTS = [
  {
    id: 'cheapest',
    keywords: ['cheap', 'cheapest', 'lowest premium', 'save money', 'save on premium', 'least expensive', 'low cost', 'cost-effective', 'save premium'],
    title: '💰 Lowest Premium',
    followups: ['deductibles', 'choice3'],
    getResponse: (group, tier) => {
      return `💰 <b>Lowest Premium Option: Open Choice 3</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Premium Cost:</b> Open Choice 3 has the lowest monthly employee premiums (often $0 depending on your bargaining group).</li>
        <li><b>The Catch:</b> It has an in-network deductible of <b>$1,100 (Individual) / $2,200 (Family)</b>. You must pay 100% of diagnostic costs (like standard X-Rays, Lab work, and MRIs/CT scans) out-of-pocket until you meet this deductible.</li>
        <li><b>Gist:</b> Excellent if you are healthy and want to save on monthly deductions, but carries upfront out-of-pocket risk for medical tests.</li>
      </ul>`;
    }
  },
  {
    id: 'open_access',
    keywords: ['open access', ' oa', 'oa ', 'best bang', 'no deductible plan'],
    title: '🚀 Open Access',
    followups: ['cheapest', 'deductibles'],
    getResponse: (group, tier) => {
      return `🚀 <b>Open Access Plan ("Best Bang for Your Buck")</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Premium Cost:</b> Higher monthly premium deductions than Choice 3.</li>
        <li><b>Benefit:</b> <b>$0 Deductible</b> in-network. You only pay flat copays for visits ($15 PCP, $25 specialist) and diagnostics are 100% covered immediately ($0).</li>
        <li><b>Gist:</b> Best predictability. If you go to the doctor often or want zero financial surprise at the clinic, this plan offers the greatest value.</li>
      </ul>`;
    }
  },
  {
    id: 'choice2',
    keywords: ['choice 2', 'oc2', 'mercedes'],
    title: '🚗 Open Choice 2',
    followups: ['open_access', 'choice1'],
    getResponse: (group, tier) => {
      return `🚗 <b>Open Choice 2 ("The Mercedes Plan")</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Premium Cost:</b> Moderate monthly premiums.</li>
        <li><b>Benefit:</b> Extremely comprehensive coverage with highest monthly premium. You go girl!</li>
      </ul>`;
    }
  },
  {
    id: 'choice1',
    keywords: ['choice 1', 'oc1', 'premium classic'],
    title: '✨ Open Choice 1',
    followups: ['choice2', 'open_access'],
    getResponse: (group, tier) => {
      const isEliminated = group === 'cbea' || group.startsWith('transportation');
      return `✨ <b>Open Choice 1 ("The Premium Classic")</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Availability:</b> ${isEliminated ? '❌ <b style="color: #ef4444;">Eliminated</b> for Teachers (CBEA) and Transportation, but still available for Act 93, Confidentials, and Support Staff.' : '✅ Available for your active group.'}</li>
        <li><b>Benefit:</b> $0 in-network deductible, $10 PCP, $20 Specialist, and unique $75/day daily hospital copays (max $375).</li>
      </ul>`;
    }
  },
  {
    id: 'deductibles',
    keywords: ['deductible', 'deductibles', 'deduct', 'deductable'],
    title: '🛡️ Deductibles',
    followups: ['oop_max', 'cheapest'],
    getResponse: (group, tier) => {
      const ded3 = tier === 'family' ? '$2,200 (Family)' : '$1,100 (Individual)';
      return `🛡️ <b>In-Network Deductible Comparison (${tier === 'family' ? 'Family Tier' : 'Individual Tier'}):</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Open Access:</b> $0 Deductible</li>
        <li><b>Open Choice 1:</b> $0 Deductible</li>
        <li><b>Open Choice 2:</b> $0 Deductible</li>
        <li><b>Open Choice 3:</b> <b>${ded3}</b></li>
      </ul>
      <p style="margin-top: 0.35rem; font-size: 0.75rem; font-style: italic;">Note: For Open Choice 3, you pay 100% of diagnostic services (X-rays, labs, imaging, etc.) out-of-pocket until the deductible is met. All other plans cover diagnostics immediately with no deductible.</p>`;
    }
  },
  {
    id: 'diagnostics',
    keywords: ['x-ray', 'xray', 'scan', 'mri', 'imaging', 'lab', 'laboratory', 'diagnostic', 'ct scan', 'blood work', 'ultrasound'],
    title: '🩻 X-Rays & Lab',
    followups: ['deductibles', 'choice3'],
    getResponse: (group, tier) => {
      const dedVal = tier === 'family' ? '$2,200 family deductible' : '$1,100 individual deductible';
      return `🩻 <b>Diagnostic & Imaging Coverage:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Open Access:</b> 100% Covered ($0 cost) immediately.</li>
        <li><b>Open Choice 1:</b> $20 Copay (Labs 100% covered).</li>
        <li><b>Open Choice 2:</b> $40 Copay for X-Rays, $20 Copay for Complex Imaging/MRIs (Labs 100% covered).</li>
        <li><b>Open Choice 3:</b> <b>100% Covered ONLY after meeting the deductible</b> (${dedVal}). You pay full allowed cost until then.</li>
      </ul>`;
    }
  },
  {
    id: 'dental',
    keywords: ['dental', 'teeth', 'tooth', 'dentist', 'braces', 'ortho', 'orthodontia', 'gum'],
    title: '🦷 Dental Benefits',
    followups: ['vision', 'network'],
    getResponse: (group, tier) => {
      const isSupport = group === 'support_12' || group === 'support_10';
      const isCbea = group === 'cbea';
      if (isSupport) {
        return `🦷 <b>Dental Eligibility for Support Staff:</b><br>
        <span style="color: #ef4444; font-weight: 600;">Dental is NOT offered</span> to Support Staff (10 or 12 month) under the active school district contract.<br>
        <p style="margin-top: 0.35rem; font-size: 0.75rem;">Support staff are ineligible for the voluntary dental premium plan.</p>`;
      }
      const ratesStr = isCbea ? `Your voluntary rates are: Single: $8.00/mo, 2-Party: $16.00/mo, Family: $24.00/mo.` : `Check the simulator for active rates.`;
      return `🦷 <b>Voluntary Dental Plan Rules & Summaries:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Active Group Rate:</b> ${ratesStr}</li>
        <li><b>Plan Summaries:</b> 
          <ul>
            <li><a href="docs/guardian-dental-teachers.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Guardian Dental Kit 1 (Teachers/Admin)</a></li>
            <li><a href="docs/guardian-dental-support.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Guardian Dental Kit 2 (Support Staff)</a></li>
          </ul>
        </li>
        <li><b>General Rule:</b> Offered to Teachers (CBEA), Act 93, Confidentials, and Transportation as a voluntary add-on.</li>
      </ul>`;
    }
  },
  {
    id: 'vision',
    keywords: ['vision', 'eye', 'glasses', 'eyemed', 'contacts', 'optometrist', 'ophthalmologist', 'lens'],
    title: '👁️ Vision Benefits',
    followups: ['dental', 'network'],
    getResponse: (group, tier) => {
      return `👁️ <b>Voluntary Vision (Eye Med) Rates & Benefits:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>EyeMed Summary:</b> Check the detailed <a href="docs/eyemed-benefits.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">EyeMed Vision Benefits PDF</a> for copays on exams, lenses, and frames.</li>
        <li><b>Monthly Rates (offered to all groups):</b>
          <ul>
            <li><b>Single:</b> $5.62</li>
            <li><b>2-Party:</b> $10.68</li>
            <li><b>Family:</b> $15.69</li>
          </ul>
        </li>
      </ul>`;
    }
  },
  {
    id: 'hours_rule',
    keywords: ['1080', 'hours', 'transportation rule', 'under 1080', 'part time transportation', 'part-time bus'],
    title: '🚌 1080 Hours Rule',
    followups: ['cheapest', 'open_access'],
    getResponse: (group, tier) => {
      return `🚌 <b>Transportation (10-Month) under 1080 Hours Rule:</b><br>
      If you are a 10-Month Transportation employee working under 1080 hours per year:
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li>You are <b>not eligible</b> for the Open Access plan.</li>
        <li>Your Open Choice 3 rates automatically scale to higher employee-share premium rates.</li>
      </ul>`;
    }
  },
  {
    id: 'network',
    keywords: ['network', 'out-of-network', 'oon', 'in-network', 'doctor', 'physician', 'find a', 'provider', 'directory', 'specialist visit', 'pcp visit', 'copay', 'office visit', 'co-pay', 'visit cost', 'pcp', 'specialist'],
    title: '🏥 Copays & Doctor Finder',
    followups: ['deductibles', 'oop_max'],
    getResponse: (group, tier) => {
      return `🏥 <b>Copays & Provider Networks:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>PCP Office Visit Copays:</b>
          <ul>
            <li>Open Access: $15</li>
            <li>Choice 1: $10</li>
            <li>Choice 2: $20</li>
            <li>Choice 3: $25 (covered immediately, before deductible)</li>
          </ul>
        </li>
        <li><b>Specialist Visit Copays:</b>
          <ul>
            <li>Open Access: $25</li>
            <li>Choice 1: $20</li>
            <li>Choice 2: $40</li>
            <li>Choice 3: $50 (covered immediately, before deductible)</li>
          </ul>
        </li>
        <li><b>Find a Doctor:</b> Verify network status via the <a href="https://www.aetna.com/dsepublic/#/contentPage?page=providerSearchLanding&site_id=asa&language=en" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Aetna Provider Finder</a>.</li>
        <li><b>Out-of-Network Coinsurance:</b> Open Access & Choice 3: 50% member coinsurance. Choice 1 & Choice 2: 70% member coinsurance.</li>
      </ul>`;
    }
  },
  {
    id: 'maternity',
    keywords: ['baby', 'maternity', 'pregnant', 'childbirth', 'delivery', 'prenatal', 'pregnancy', 'having a baby', 'newborn', 'obstetrician', 'obgyn'],
    title: '👶 Maternity',
    followups: ['oop_max', 'network'],
    getResponse: (group, tier) => {
      const isFamily = tier === 'family';
      const maxExposure = isFamily ? '$13,200' : '$6,600';
      return `👶 <b>Maternity & Newborn Coverage (${isFamily ? 'Family Tier' : 'Individual Tier'}):</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Prenatal & Postnatal Visits:</b> 100% covered in-network ($0 cost) across all plans.</li>
        <li><b>Delivery & Hospital Stay:</b> Covered under Inpatient Admission:
          <ul>
            <li><b>Open Access:</b> $250 Copay per admission.</li>
            <li><b>Open Choice 2:</b> $350 Copay per admission.</li>
            <li><b>Open Choice 3:</b> $300 Copay per admission (deductible does not apply).</li>
            <li><b>Open Choice 1:</b> $75 per day (max $375 per admission).</li>
          </ul>
        </li>
        <li><b>Maximum Exposure:</b> Your in-network out-of-pocket maximum is <b>${maxExposure}</b>.</li>
      </ul>`;
    }
  },
  {
    id: 'surgery',
    keywords: ['surgery', 'operation', 'outpatient', 'procedure', 'hospitalization', 'admitted', 'inpatient stay'],
    title: '🔪 Surgery',
    followups: ['maternity', 'network'],
    getResponse: (group, tier) => {
      return `🔪 <b>Surgery & Outpatient Care Coverage:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Open Access:</b> $100 outpatient copay / $250 inpatient copay.</li>
        <li><b>Open Choice 1:</b> $75 outpatient copay / $75 daily inpatient (max $375).</li>
        <li><b>Open Choice 2:</b> $200 outpatient copay / $350 inpatient copay.</li>
        <li><b>Open Choice 3:</b> $200 outpatient copay / $300 inpatient copay (deductible does not apply to outpatient surgery or inpatient admission).</li>
      </ul>`;
    }
  },
  {
    id: 'rx',
    keywords: ['prescription', 'meds', 'drugs', 'pharmacy', 'rx', 'pills', 'medication', 'capital rx'],
    title: '💊 Prescriptions',
    followups: ['network', 'cheapest'],
    getResponse: (group, tier) => {
      const isTrans = group.startsWith('transportation');
      const noteStr = isTrans ? `<b>Note:</b> Under your Transportation contract, retail Tier 2/3/4 copays are slightly lower ($20/$35/$35) and mail-order Tier 2 is $40.` : `Prescription benefits are identical for Teachers, Act 93, Confidentials, and Support Staff.`;
      return `💊 <b>Prescription Drug Coverage (Capital Rx):</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>30-Day Retail:</b> Generic ($10), Preferred Brand ($25), Non-Preferred ($40), Specialty ($100).</li>
        <li><b>90-Day Mail Order:</b> Generic ($20), Preferred Brand ($50), Non-Preferred ($80).</li>
        <li>${noteStr}</li>
        <li><b>Portal:</b> Log in to <a href="https://app.cap-rx.com/login" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Capital Rx Portal</a> to manage prescriptions.</li>
      </ul>`;
    }
  },
  {
    id: 'er',
    keywords: ['er ', 'emergency', 'accident', 'ambulance', 'urgent care', 'er copay'],
    title: '🚨 Emergency Care',
    followups: ['surgery', 'network'],
    getResponse: (group, tier) => {
      const dedMsg = tier === 'family' ? 'family deductible ($2,200)' : 'individual deductible ($1,100)';
      return `🚨 <b>Emergency Room, Ambulance & Urgent Care:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Emergency Room Visit:</b> <b>$100 Copay</b> across all four plans (waived immediately if admitted).</li>
        <li><b>Urgent Care Visit:</b> Open Access ($24), Choice 1 ($28), Choice 2 ($28), Choice 3 ($50).</li>
        <li><b>Ambulance Services:</b>
          <ul>
            <li>Open Access, Choice 1, Choice 2: 100% Covered ($0 cost).</li>
            <li>Open Choice 3: 100% Covered <i>after meeting the deductible</i> (${dedMsg}).</li>
          </ul>
        </li>
      </ul>`;
    }
  },
  {
    id: 'choice3',
    keywords: ['choice 3', 'oc3', 'thrift', 'saver', 'high deductible', 'hdhp'],
    title: '🛡️ Open Choice 3',
    followups: ['cheapest', 'deductibles'],
    getResponse: (group, tier) => {
      const dedStr = tier === 'family' ? '$2,200 (Family)' : '$1,100 (Individual)';
      return `🛡️ <b>Open Choice 3 ("The Thrift Option")</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Premium Cost:</b> Lowest monthly premium of any plan.</li>
        <li><b>In-Network Deductible:</b> <b>${dedStr}</b>. You pay 100% of diagnostic costs out-of-pocket until met.</li>
        <li><b>Gist:</b> High deductible risk, but compensated by very low (or $0) paycheck deductions.</li>
      </ul>`;
    }
  },
  {
    id: 'covered_services',
    keywords: ['acupuncture', 'bariatric', 'infertility', 'private duty', 'nursing', 'chiropractic', 'chiro', 'covered services', 'pt', 'physical therapy', 'occupational therapy', 'speech therapy', 'therapy limit', 'manipulation'],
    title: '⚕️ Covered Services & PT',
    followups: ['network', 'choice2'],
    getResponse: (group, tier) => {
      return `⚕️ <b>Covered Therapies & Special Services:</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Chiropractic Care:</b> Covered in-network (100 visits/yr for Open Access; 30 visits/yr for Choice 1, 2, & 3).</li>
        <li><b>Physical / Speech / Occupational Therapy:</b>
          <ul>
            <li>Open Access: 100% covered ($0). Limit 240 visits.</li>
            <li>Choice 1: $15 copay (visits 1-30) / $25 copay (visits 31-60). Limit 60 visits.</li>
            <li>Choice 2: $20 copay (visits 1-30) / $40 copay (visits 31-60). Limit 60 visits.</li>
            <li>Choice 3: $25 copay (visits 1-30) / $50 copay (visits 31-60). Limit 60 visits.</li>
          </ul>
        </li>
        <li><b>Acupuncture:</b> Covered in-network across all plans (limitations/preauthorization may apply).</li>
        <li><b>Bariatric Surgery:</b> Covered in-network (limit 1 procedure per lifetime).</li>
        <li><b>Private-Duty Nursing:</b> Covered in-network (limit 45 shifts of 8 hours per plan year).</li>
      </ul>`;
    }
  },
  {
    id: 'oop_max',
    keywords: ['out of pocket max', 'oop max', 'out-of-pocket maximum', 'exposure', 'ceiling', 'cap', 'limit', 'worst case', 'catastrophic'],
    title: '🛡️ OOP Max',
    followups: ['deductibles', 'cheapest'],
    getResponse: (group, tier) => {
      const maxVal = tier === 'family' ? '$13,200' : '$6,600';
      return `🛡️ <b>In-Network Out-of-Pocket Maximum (${tier === 'family' ? 'Family Tier' : 'Individual Tier'}):</b><br>
      <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
        <li><b>Standard Limit:</b> The maximum out-of-pocket exposure is <b>${maxVal}</b> in-network. This applies to Open Access, Open Choice 2, and Open Choice 3.</li>
        <li><b>Open Choice 1:</b> The in-network OOP Max is slightly lower or different; please refer to the SBC documentation for specific group caps.</li>
        <li><b>Worst-Case Scenario:</b> Once you hit this ceiling, the plan pays 100% of all covered in-network medical and prescription expenses for the rest of the plan year.</li>
      </ul>`;
    }
  }
];

function generateBotResponse(userInput) {
  const query = userInput.toLowerCase().trim()
    .replace(/[?.,!/\\()&]/g, ' ')
    .replace(/\s+/g, ' ');

  const activeGroup = typeof selectGroup !== 'undefined' && selectGroup ? selectGroup.value : 'cbea';
  const activeTier = typeof selectTier !== 'undefined' && selectTier ? selectTier.value : 'family';
  
  // Scoring algorithm
  let bestIntent = null;
  const scoredIntents = [];

  for (const intent of BOT_INTENTS) {
    let score = 0;
    
    // Check keyword matching
    for (const keyword of intent.keywords) {
      if (query.includes(keyword)) {
        // Calculate matches
        // Phrase length multiplier
        const wordCount = keyword.split(' ').length;
        score += wordCount * 5;
        
        // Exact word boundary matching checks
        const regex = new RegExp('\\b' + keyword.trim() + '\\b', 'i');
        if (regex.test(query)) {
          score += 5;
        }
      }
    }
    
    if (score > 0) {
      scoredIntents.push({ intent, score });
    }
  }
  
  // Sort by score descending
  scoredIntents.sort((a, b) => b.score - a.score);
  
  if (scoredIntents.length > 0 && scoredIntents[0].score >= 5) {
    const selected = scoredIntents[0].intent;
    let reply = selected.getResponse(activeGroup, activeTier);
    
    // Append dynamic follow-up chips if they exist
    if (selected.followups && selected.followups.length > 0) {
      reply += `<div class="chat-followups">`;
      for (const fId of selected.followups) {
        const found = BOT_INTENTS.find(i => i.id === fId);
        if (found) {
          reply += `<button class="chat-followup-btn" data-q="${found.keywords[0]}">${found.title}</button>`;
        }
      }
      reply += `</div>`;
    }
    return reply;
  }
  
  // Fallback did-you-mean suggestion engine
  let fallbackReply = `❓ <b>I'm not quite sure about that question.</b><br>
  I can help answer questions or compare scenarios for the 2026-27 healthcare plans.<br>
  Here are some topics you can ask me about:<br>
  <div class="chat-followups" style="margin-top: 0.5rem; border-top: none;">`;
  
  const popular = ['cheapest', 'deductibles', 'dental', 'network', 'rx', 'maternity'];
  for (const fId of popular) {
    const found = BOT_INTENTS.find(i => i.id === fId);
    if (found) {
      fallbackReply += `<button class="chat-followup-btn" data-q="${found.keywords[0]}">${found.title}</button>`;
    }
  }
  fallbackReply += `</div>`;
  return fallbackReply;
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

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot typing';
  typingDiv.id = 'chat-typing-indicator';
  typingDiv.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  if (chatMessages) {
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById('chat-typing-indicator');
  if (typingDiv) {
    typingDiv.remove();
  }
}

function handleUserMessage() {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text) return;
  
  appendMessage('user', text);
  chatInput.value = '';
  
  showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator();
    const reply = generateBotResponse(text);
    appendMessage('bot', reply);
  }, 600 + Math.random() * 200);
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
    
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const reply = generateBotResponse(question);
      appendMessage('bot', reply);
    }, 500);
  });
});

// Event Delegation for Dynamic Follow-up Chips
if (chatMessages) {
  chatMessages.addEventListener('click', (e) => {
    const btn = e.target.closest('.chat-followup-btn');
    if (btn) {
      const question = btn.dataset.q;
      if (question) {
        appendMessage('user', btn.textContent);
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          const reply = generateBotResponse(question);
          appendMessage('bot', reply);
        }, 500);
      }
    }
  });
}

// ==========================================
// 14. Sidebar Enrollment PDF Dropdown Selector
// ==========================================
const selectEnrollmentGroup = document.getElementById('select-enrollment-group');
const btnDownloadEnrollment = document.getElementById('btn-download-enrollment');

if (selectEnrollmentGroup && btnDownloadEnrollment) {
  selectEnrollmentGroup.addEventListener('change', () => {
    if (selectEnrollmentGroup.value) {
      btnDownloadEnrollment.disabled = false;
    } else {
      btnDownloadEnrollment.disabled = true;
    }
  });

  btnDownloadEnrollment.addEventListener('click', () => {
    const url = selectEnrollmentGroup.value;
    if (url) {
      window.open(url, '_blank');
    }
  });
}

function renderDentalCheatList() {
  const group = selectGroup.value;
  const filter = dentalCheatSearchInput ? dentalCheatSearchInput.value.toLowerCase() : '';
  
  if (!dentalCheatListContainer) return;
  dentalCheatListContainer.innerHTML = '';
  
  const isSupport = group === 'support_12' || group === 'support_10';
  
  if (isSupport) {
    dentalCheatListContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">🦷</span>
        <h4 style="margin: 0 0 0.5rem; color: #991b1b; font-size: 0.95rem;">Dental Benefits Not Offered</h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0 auto; max-width: 320px;">
          Under the current Support Staff contract (both 10 & 12 Month), dental coverage is not available as a voluntary plan option.
        </p>
      </div>
    `;
    return;
  }
  
  // Dental benefits items for all other groups
  const listItems = [
    { name: '🦷 Calendar Year Deductible', value: '$0 / person (No Deductible)', desc: 'You do not have to pay anything out-of-pocket before benefits begin.' },
    { name: '✨ Preventive Care (Cleanings & Exams)', value: '100% Covered (In-Network)', desc: 'Routine checkups, exams, cleanings, and diagnostic X-rays. Allowed once every 6 months.' },
    { name: 'Basic Services (Fillings & Root Canals)', value: '80% Covered (In-Network)', desc: 'Basic restorative fillings, root canals, simple extractions, and emergency pain relief.' },
    { name: '👑 Major Services (Crowns & Bridges)', value: '50% Covered (In-Network)', desc: 'Major restorative work including crowns, bridges, inlays, onlays, and dentures.' },
    { name: '💰 Annual Benefit Maximum', value: '$2,000 per person / year', desc: 'The maximum total amount Guardian will pay for dental services per person in a calendar year.' }
  ];
  
  // Orthodontia depends on the group
  const isTrans = group === 'transportation_12' || group === 'transportation_10';
  if (isTrans) {
    listItems.push({ name: '👧 Child Orthodontia (Braces)', value: 'Not Covered', desc: 'Kit 2 for Transportation does not offer child orthodontia.' });
  } else {
    listItems.push({ name: '👧 Child Orthodontia (Braces)', value: '50% Covered (up to $1,000 Lifetime Max)', desc: 'For children under age 19. Caps at a $1,000 maximum per child.' });
  }
  
  // Maximum Rollover details
  listItems.push({ name: '📈 Maximum Rollover Threshold', value: '$800 maximum claim submissions', desc: 'If your total claims for the year are under $800, you are eligible to roll over funds.' });
  listItems.push({ name: '💵 Rollover Account Addition', value: '+$400 (+$600 if using in-network only)', desc: 'The amount rolled over into your MRA account (Maximum Rollover Account).' });
  listItems.push({ name: '🔒 Rollover Account Cap', value: '$1,500 maximum account balance', desc: 'The maximum total balance you can accumulate in your rollover account.' });
  
  // Filter items
  const filteredItems = listItems.filter(item => 
    item.name.toLowerCase().includes(filter) || 
    item.value.toLowerCase().includes(filter) ||
    item.desc.toLowerCase().includes(filter)
  );
  
  if (filteredItems.length === 0) {
    dentalCheatListContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin: 1.5rem 0;">No matching dental benefits found.</div>`;
    return;
  }
  
  // Render
  filteredItems.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cheat-item';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'stretch';
    row.style.gap = '0.35rem';
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
        <span class="cheat-item-name" style="font-size: 0.825rem;">${item.name}</span>
        <span class="cheat-item-value" style="font-size: 0.775rem;">${item.value}</span>
      </div>
      <div style="font-size: 0.725rem; color: var(--text-secondary); line-height: 1.35; opacity: 0.85;">${item.desc}</div>
    `;
    dentalCheatListContainer.appendChild(row);
  });
}
