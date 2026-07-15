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
    } else if (activeBenefit === 'chiro') {
      const chiroVal = plan.in.chiro_copay;
      if (chiroVal === 0) inText = '100% Covered<br><span style="font-size: 0.7rem; opacity: 0.8;">(See SPD for details)</span>';
      else inText = `$${chiroVal} Copay<br><span style="font-size: 0.7rem; opacity: 0.8;">(See SPD for details)</span>`;
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
      <li><b>Benefit:</b> Extremely comprehensive coverage with highest monthly premium. You go girl!</li>
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
    return `🦷 <b>Voluntary Dental Plan Rules & Summaries:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Plan Summaries:</b> 
        <ul>
          <li><a href="docs/guardian-dental-teachers.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Guardian Dental Kit 1 (Teachers/Admin)</a></li>
          <li><a href="docs/guardian-dental-support.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Guardian Dental Kit 2 (Support Staff)</a></li>
        </ul>
      </li>
      <li><b>Support Staff:</b> Dental is <b>not offered</b> to Support Staff (10 or 12 month) under the district contract.</li>
      <li><b>Teachers (CBEA):</b> Available voluntary dental rate is $8.00 (Single), $16.00 (2-Party), or $24.00 (Family).</li>
      <li><b>Others:</b> Available for Act 93, Confidentials, and Transportation as a voluntary monthly add-on.</li>
    </ul>`;
  }

  // 8. Vision / Eye Med
  if (query.includes('vision') || query.includes('eye') || query.includes('glasses') || query.includes('eyemed')) {
    return `👁️ <b>Voluntary Vision (Eye Med) Rates & Benefits:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>EyeMed Summary:</b> Check the detailed <a href="docs/eyemed-benefits.pdf" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">EyeMed Vision Benefits PDF</a> for copays on exams, lenses, and frames.</li>
      <li><b>Rates (offered to all groups):</b>
        <ul>
          <li><b>Single:</b> $5.62 / month</li>
          <li><b>2-Party:</b> $10.68 / month</li>
          <li><b>Family:</b> $15.69 / month</li>
        </ul>
      </li>
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
  if (query.includes('network') || query.includes('out-of-network') || query.includes('oon') || query.includes('in-network') || query.includes('doctor') || query.includes('physician') || query.includes('find a')) {
    return `🏥 <b>In-Network vs. Out-of-Network & Doctor Directory:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Find a Doctor:</b> Verify if your doctor is in-network using the official <a href="https://www.aetna.com/dsepublic/#/contentPage?page=providerSearchLanding&site_id=asa&language=en" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Aetna Provider Finder</a>.</li>
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

  // 11. Maternity / Having a Baby
  if (query.includes('baby') || query.includes('maternity') || query.includes('pregnant') || query.includes('childbirth') || query.includes('delivery') || query.includes('prenatal') || query.includes('pregnancy')) {
    return `👶 <b>Having a Baby / Maternity Coverage:</b><br>
    If you are welcoming a new baby under the family plan:
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Prenatal & Postnatal Care:</b> 100% covered in-network ($0 cost) across all plans (considered preventive care under the ACA).</li>
      <li><b>Delivery & Hospital Stay:</b> Covered under Inpatient Hospitalization:
        <ul>
          <li><b>Open Access:</b> $250 Copay per admission.</li>
          <li><b>Open Choice 2:</b> $350 Copay per admission.</li>
          <li><b>Open Choice 3:</b> $300 Copay per admission (the in-net deductible does not apply to this copay).</li>
          <li><b>Open Choice 1:</b> $75 per day (max $375 per admission).</li>
        </ul>
      </li>
      <li><b>Pediatric Visits (Well-Baby Checks):</b> Preventive wellness checkups are 100% covered ($0). Sick visits go under PCP copays ($15 OA, $20 Choice 2, $25 Choice 3, $10 Choice 1).</li>
      <li><b>Max Exposure:</b> The family out-of-pocket maximum limit is <b>$13,200</b> for all plans in-network.</li>
    </ul>`;
  }

  // 12. Surgeries / Outpatient Care
  if (query.includes('surgery') || query.includes('operation') || query.includes('outpatient') || query.includes('procedure')) {
    return `🔪 <b>Outpatient Surgery Coverage:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Open Access:</b> $100 Copay in-network (deductible: $0).</li>
      <li><b>Open Choice 1:</b> $75 Copay in-network (deductible: $0).</li>
      <li><b>Open Choice 2:</b> $200 Copay in-network (deductible: $0).</li>
      <li><b>Open Choice 3:</b> $200 Copay in-network (deductible does not apply to outpatient surgery in-network).</li>
    </ul>`;
  }

  // 13. Prescriptions / Pharmacy
  if (query.includes('prescription') || query.includes('meds') || query.includes('drugs') || query.includes('pharmacy') || query.includes('rx')) {
    return `💊 <b>Prescription Drug Coverage (Capital Rx):</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Automatic Benefit:</b> Prescription coverage is automatically included with all CBSD medical plans (no add-on selection needed).</li>
      <li><b>Capital Rx Login:</b> Log in or register at the <a href="https://app.cap-rx.com/login" target="_blank" style="color: var(--accent-blue); text-decoration: underline;">Capital Rx Portal</a> to track your prescriptions, look up covered drugs, and manage your account.</li>
      <li><b>30-Day Retail Tiers:</b> Generic ($10), Preferred Brand ($25), Non-Preferred Brand ($40), Specialty ($100).</li>
      <li><b>90-Day Mail Order Tiers:</b> Generic ($20), Preferred Brand ($50), Non-Preferred ($80).</li>
      <li><b>Note:</b> Under the Transportation contract, retail Tier 2/3/4 copays are slightly lower ($20/$35/$35) and mail-order Tier 2 is $40.</li>
    </ul>`;
  }

  // 14. Emergency Room & Ambulance
  if (query.includes('er ') || query.includes('emergency') || query.includes('accident') || query.includes('ambulance')) {
    return `🚨 <b>Emergency Room & Ambulance Care:</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Emergency Room Visit:</b> <b>$100 Copay</b> across all four plans (waived immediately if admitted directly to the hospital).</li>
      <li><b>Ambulance Services:</b>
        <ul>
          <li>Open Access, Choice 1, Choice 2: 100% Covered ($0 cost).</li>
          <li>Open Choice 3: 100% Covered <i>after meeting the deductible</i> ($1,100 Ind / $2,200 Fam).</li>
        </ul>
      </li>
    </ul>`;
  }

  // 15. Open Choice 3 / Thrift Option
  if (query.includes('choice 3') || query.includes('oc3') || query.includes('thrift') || query.includes('saver')) {
    return `🛡️ <b>Open Choice 3 ("The Thrift Option")</b><br>
    <ul style="margin: 0.35rem 0 0; padding-left: 1.15rem; font-size: 0.775rem; display: flex; flex-direction: column; gap: 0.2rem;">
      <li><b>Premium Cost:</b> Lowest monthly premium of any plan.</li>
      <li><b>Benefit:</b> In exchange, you pay 100% of diagnostics out-of-pocket until you meet the deductible. Stay safe out there!</li>
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
