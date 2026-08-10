/* ==========================================================================
   Food Waste Reducer & Sharing Guide — ACD Sustainable Living Initiative
   Comprehensive JavaScript Application Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Remove preload class shortly after DOM ready to enable smooth transition animations
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 60);
  });

  /* ==========================================================================
     1. LocalStorage State & Gamification Engine
     ========================================================================== */
  const GameState = {
    getPoints: () => parseInt(localStorage.getItem('acd_eco_points') || '0', 10),
    setPoints: (val) => {
      localStorage.setItem('acd_eco_points', val);
      updatePointsUI();
    },
    addPoints: (val, reason) => {
      const current = GameState.getPoints();
      const updated = current + val;
      GameState.setPoints(updated);
      showToast(`+${val} Eco Points! ${reason || ''}`, 'success');
      checkLevelAndBadges();
    },
    getRole: () => localStorage.getItem('acd_user_role') || 'student',
    setRole: (role) => {
      localStorage.setItem('acd_user_role', role);
      updateRoleUI();
    },
    getUnlockedBadges: () => JSON.parse(localStorage.getItem('acd_unlocked_badges') || '["first_step"]'),
    unlockBadge: (badgeId, badgeName) => {
      const unlocked = GameState.getUnlockedBadges();
      if (!unlocked.includes(badgeId)) {
        unlocked.push(badgeId);
        localStorage.setItem('acd_unlocked_badges', JSON.stringify(unlocked));
        showToast(`🏆 Badge Unlocked: ${badgeName}!`, 'success');
        triggerConfetti();
        updateBadgesUI();
      }
    },
    isChallengeCompleted: (dateKey) => localStorage.getItem(`acd_challenge_${dateKey}`) === 'true',
    setChallengeCompleted: (dateKey) => {
      localStorage.setItem(`acd_challenge_${dateKey}`, 'true');
    }
  };

  /* Level threshold config */
  const LEVELS = [
    { level: 1, name: 'Seedling Saver', minPoints: 0 },
    { level: 2, name: 'Eco Helper', minPoints: 30 },
    { level: 3, name: 'Food Saver', minPoints: 70 },
    { level: 4, name: 'Steward Champion', minPoints: 120 },
    { level: 5, name: 'Creation Care Hero', minPoints: 200 }
  ];

  function getLevelInfo(points) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].minPoints) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || LEVELS[i];
      }
    }
    const range = (next.minPoints - current.minPoints) || 1;
    const progressInLevel = points - current.minPoints;
    const percentage = Math.min(100, Math.max(0, Math.round((progressInLevel / range) * 100)));
    return { current, next, percentage };
  }

  function updatePointsUI() {
    const points = GameState.getPoints();
    const pointsDisplays = document.querySelectorAll('.eco-points-val');
    pointsDisplays.forEach(el => el.textContent = points);

    const levelInfo = getLevelInfo(points);
    const levelTitleDisplays = document.querySelectorAll('.user-level-title');
    levelTitleDisplays.forEach(el => el.textContent = `Level ${levelInfo.current.level} — ${levelInfo.current.name}`);

    const progressFills = document.querySelectorAll('.user-level-fill');
    progressFills.forEach(el => el.style.width = `${levelInfo.percentage}%`);

    const progressTexts = document.querySelectorAll('.user-level-percentage');
    progressTexts.forEach(el => el.textContent = `${levelInfo.percentage}%`);
  }

  function checkLevelAndBadges() {
    const points = GameState.getPoints();
    if (points >= 30) GameState.unlockBadge('sorting_pro', 'Sorting Pro');
    if (points >= 70) GameState.unlockBadge('food_saver', 'Food Saver');
    if (points >= 120) GameState.unlockBadge('smart_planner', 'Smart Planner');
    if (points >= 200) GameState.unlockBadge('creation_care', 'Creation Care Champion');
  }

  function updateBadgesUI() {
    const unlocked = GameState.getUnlockedBadges();
    const badgeCards = document.querySelectorAll('.badge-card[data-badge-id]');
    badgeCards.forEach(card => {
      const id = card.getAttribute('data-badge-id');
      if (unlocked.includes(id)) {
        card.classList.add('unlocked');
        const statusLbl = card.querySelector('.badge-status');
        if (statusLbl) statusLbl.textContent = '✅ Unlocked';
      }
    });
  }

  /* ==========================================================================
     2. Theme Management (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  applyTheme(currentTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
      applyTheme(currentTheme);
      showToast(`Switched to ${currentTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    });
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    themeToggleBtns.forEach(btn => {
      const label = btn.querySelector('.theme-btn-lbl');
      if (label) label.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }

  /* ==========================================================================
     3. Mobile Drawer Navigation & Quick Help Modal
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      hamburgerBtn.setAttribute('aria-expanded', isExpanded);
      hamburgerBtn.textContent = isExpanded ? '✕ Close' : '☰ Menu';
    });
  }

  /* Quick Help Floating Action Button */
  const fabHelpBtn = document.getElementById('fab-quick-help');
  const quickHelpModal = document.getElementById('quick-help-modal');
  const closeHelpModal = document.getElementById('close-help-modal');

  if (fabHelpBtn && quickHelpModal) {
    fabHelpBtn.addEventListener('click', () => {
      quickHelpModal.classList.add('active');
    });
  }

  if (closeHelpModal && quickHelpModal) {
    closeHelpModal.addEventListener('click', () => {
      quickHelpModal.classList.remove('active');
    });

    quickHelpModal.addEventListener('click', (e) => {
      if (e.target === quickHelpModal) {
        quickHelpModal.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     4. Toast Notification Helper
     ========================================================================== */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3800);
  }

  function triggerConfetti() {
    // Lightweight visual pop effect
    const pop = document.createElement('div');
    pop.style.position = 'fixed';
    pop.style.top = '30%';
    pop.style.left = '50%';
    pop.style.transform = 'translate(-50%, -50%)';
    pop.style.fontSize = '4rem';
    pop.style.zIndex = '99999';
    pop.style.pointerEvents = 'none';
    pop.textContent = '🎉✨🌱';
    document.body.appendChild(pop);
    setTimeout(() => {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1200);
  }

  /* ==========================================================================
     5. Role Selection Experience (`index.html`)
     ========================================================================== */
  const roleCards = document.querySelectorAll('.role-card[data-role]');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedRole = card.getAttribute('data-role');
      GameState.setRole(selectedRole);
      roleCards.forEach(c => c.classList.remove('active-role'));
      card.classList.add('active-role');
      showToast(`Selected Role: ${selectedRole.toUpperCase()}!`, 'success');
      
      // Smooth scroll to Food Waste Journey or redirect
      const journeySection = document.getElementById('food-journey-section');
      if (journeySection) {
        journeySection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  function updateRoleUI() {
    const currentRole = GameState.getRole();
    roleCards.forEach(card => {
      if (card.getAttribute('data-role') === currentRole) {
        card.classList.add('active-role');
      } else {
        card.classList.remove('active-role');
      }
    });
  }

  /* ==========================================================================
     6. Food Waste Journey Interactive Steps (`index.html`)
     ========================================================================== */
  const journeySteps = document.querySelectorAll('.journey-step-item');
  const journeyTitle = document.getElementById('journey-detail-title');
  const journeyText = document.getElementById('journey-detail-text');
  const journeyCta = document.getElementById('journey-detail-cta');

  const JOURNEY_DATA = {
    buy: {
      title: '🛒 BUY — Shop with Intention',
      text: 'Create a meal plan and grocery list before shopping. Check your pantry and fridge first so you only buy ingredients you truly need.',
      ctaText: 'Explore Meal Planning Guide →',
      ctaUrl: 'about.html#planning'
    },
    prepare: {
      title: '🥘 PREPARE — Smart Portion Prep',
      text: 'Practice FIFO (First In, First Out) in your kitchen. Use trimming techniques to minimize food scrap waste, and adjust batch preparation to actual diner counts.',
      ctaText: 'View Kitchen Prep Tips →',
      ctaUrl: 'about.html#prep'
    },
    eat: {
      title: '🍴 EAT — Mindful Consumption',
      text: 'Serve sensible initial portions. You can always get seconds! Mindful eating ensures clean plates, healthier habits, and zero plate waste.',
      ctaText: 'Read Portion Control Tips →',
      ctaUrl: 'about.html#students'
    },
    store: {
      title: '📦 STORE — Extend Freshness',
      text: 'Store produce at optimal temperatures. Keep ethylene-emitting fruits separate, freeze extra leftovers, and utilize airtight containers.',
      ctaText: 'Try Storage Tool →',
      ctaUrl: 'quiz.html#storage-tool'
    },
    share: {
      title: '🤝 SHARE — Surplus Redistribution',
      text: 'If you have excess unopened pantry goods or extra wholesome meals, share them with neighbors, community pantries, or campus redistribution points.',
      ctaText: 'Learn Food Sharing Rules →',
      ctaUrl: 'about.html#sharing'
    },
    compost: {
      title: '♻️ COMPOST / DISPOSE — Circular Stewardship',
      text: 'Segregate organic scraps (peels, cores, grounds) into biodegradable compost bins. Keep inorganic recyclables separated to care for creation.',
      ctaText: 'Play "Sort It!" Game →',
      ctaUrl: 'quiz.html#sort-it-game'
    }
  };

  if (journeySteps.length > 0) {
    journeySteps.forEach(step => {
      step.addEventListener('click', () => {
        const stageKey = step.getAttribute('data-stage');
        journeySteps.forEach(s => s.classList.remove('active-step'));
        step.classList.add('active-step');

        const data = JOURNEY_DATA[stageKey];
        if (data && journeyTitle && journeyText && journeyCta) {
          journeyTitle.innerHTML = data.title;
          journeyText.textContent = data.text;
          journeyCta.textContent = data.ctaText;
          journeyCta.setAttribute('href', data.ctaUrl);
        }
      });
    });
  }

  /* ==========================================================================
     7. "Sort It!" Interactive Waste Segregation Mini-Game (`quiz.html`)
     ========================================================================== */
  const sortableItemsContainer = document.getElementById('draggable-items-container');
  const binCards = document.querySelectorAll('.bin-card[data-category]');

  const SORT_ITEMS = [
    { id: 'item-1', name: '🍌 Banana Peel', category: 'biodegradable' },
    { id: 'item-2', name: '🥤 Plastic Bottle', category: 'recyclable' },
    { id: 'item-3', name: '🥫 Tin Can', category: 'recyclable' },
    { id: 'item-4', name: '🍗 Leftover Food Scraps', category: 'biodegradable' },
    { id: 'item-5', name: '🧴 Plastic Shampoo Bottle', category: 'recyclable' },
    { id: 'item-6', name: '🔋 Used Battery', category: 'special' },
    { id: 'item-7', name: '📦 Cardboard Box', category: 'recyclable' },
    { id: 'item-8', name: '🥢 Disposable Wooden Chopsticks', category: 'biodegradable' },
    { id: 'item-9', name: '🚬 Used Cigarette Butt / Residual Waste', category: 'residual' }
  ];

  let currentSelectedSortItem = null;
  let gameScore = 0;
  let gameTotal = 0;

  if (sortableItemsContainer && binCards.length > 0) {
    renderSortItems();

    function renderSortItems() {
      sortableItemsContainer.innerHTML = '';
      SORT_ITEMS.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'sort-item-pill';
        itemEl.setAttribute('data-id', item.id);
        itemEl.setAttribute('data-category', item.category);
        itemEl.textContent = item.name;

        itemEl.addEventListener('click', () => {
          document.querySelectorAll('.sort-item-pill').forEach(p => p.classList.remove('selected'));
          itemEl.classList.add('selected');
          currentSelectedSortItem = item;
          showToast(`Selected "${item.name}". Now click a bin below!`, 'info');
        });

        sortableItemsContainer.appendChild(itemEl);
      });
    }

    binCards.forEach(bin => {
      bin.addEventListener('click', () => {
        if (!currentSelectedSortItem) {
          showToast('Please select a food/waste item above first!', 'info');
          return;
        }

        const targetCategory = bin.getAttribute('data-category');
        gameTotal++;

        if (targetCategory === currentSelectedSortItem.category) {
          gameScore++;
          showToast(`✅ Correct! ${currentSelectedSortItem.name} belongs in the ${targetCategory.toUpperCase()} bin!`, 'success');
          GameState.addPoints(5, 'Correct Sort');
          
          // Remove sorted item
          const itemEl = sortableItemsContainer.querySelector(`[data-id="${currentSelectedSortItem.id}"]`);
          if (itemEl) itemEl.remove();
          currentSelectedSortItem = null;
        } else {
          showToast(`❌ Incorrect! ${currentSelectedSortItem.name} does NOT belong in ${targetCategory.toUpperCase()}. Try again!`, 'warning');
        }

        // Update Score Badge
        const scoreBadge = document.getElementById('sort-game-score');
        if (scoreBadge) {
          scoreBadge.textContent = `Score: ${gameScore} / ${SORT_ITEMS.length}`;
        }

        if (sortableItemsContainer.children.length === 0) {
          showToast(`🏆 Game Complete! You scored ${gameScore}/${SORT_ITEMS.length}!`, 'success');
          GameState.unlockBadge('sorting_pro', 'Sorting Pro');
          GameState.addPoints(20, 'Sort It Game Completion');
        }
      });
    });

    const resetSortBtn = document.getElementById('reset-sort-game-btn');
    if (resetSortBtn) {
      resetSortBtn.addEventListener('click', () => {
        gameScore = 0;
        gameTotal = 0;
        currentSelectedSortItem = null;
        renderSortItems();
        const scoreBadge = document.getElementById('sort-game-score');
        if (scoreBadge) scoreBadge.textContent = `Score: 0 / ${SORT_ITEMS.length}`;
        showToast('Sorting game reset!', 'info');
      });
    }
  }

  /* ==========================================================================
     8. "Myth or Fact?" Interactive Quiz Game (`quiz.html`)
     ========================================================================== */
  const MYTH_QUESTIONS = [
    {
      statement: '“All food past its printed date is automatically unsafe to consume.”',
      isFact: false,
      explanation: 'MYTH! "Best If Used By" dates indicate peak quality, NOT food safety. Always evaluate food visually and by smell before discarding.'
    },
    {
      statement: '“Freezing food halts bacterial growth and acts as a natural pause button.”',
      isFact: true,
      explanation: 'FACT! Freezing food at 0°F (-18°C) keeps food safe indefinitely by inactivating microbes.'
    },
    {
      statement: '“Storing onions and potatoes in the same basket keeps them fresh longer.”',
      isFact: false,
      explanation: 'MYTH! Onions emit ethylene gas which causes nearby potatoes to sprout and rot much faster. Store them separately!'
    },
    {
      statement: '“Food waste in landfills generates methane gas, a potent greenhouse driver.”',
      isFact: true,
      explanation: 'FACT! Rotting food scraps in anaerobic landfills emit methane, making food waste reduction a major climate action.'
    }
  ];

  let currentMythIdx = 0;
  const mythStatementEl = document.getElementById('myth-statement-text');
  const mythBtnMyth = document.getElementById('myth-btn-myth');
  const mythBtnFact = document.getElementById('myth-btn-fact');
  const mythExplanationEl = document.getElementById('myth-explanation-box');
  const mythProgressEl = document.getElementById('myth-progress-lbl');

  if (mythStatementEl && mythBtnMyth && mythBtnFact) {
    loadMythQuestion(currentMythIdx);

    mythBtnMyth.addEventListener('click', () => handleMythAnswer(false));
    mythBtnFact.addEventListener('click', () => handleMythAnswer(true));

    function loadMythQuestion(idx) {
      const q = MYTH_QUESTIONS[idx];
      if (!q) return;
      mythStatementEl.textContent = q.statement;
      if (mythExplanationEl) mythExplanationEl.style.display = 'none';
      if (mythProgressEl) mythProgressEl.textContent = `Question ${idx + 1} of ${MYTH_QUESTIONS.length}`;
    }

    function handleMythAnswer(userChoseFact) {
      const q = MYTH_QUESTIONS[currentMythIdx];
      const isCorrect = userChoseFact === q.isFact;

      if (isCorrect) {
        showToast('🎉 Correct! Excellent eco knowledge.', 'success');
        GameState.addPoints(10, 'Quiz Answer');
      } else {
        showToast('❌ Not quite! Read the explanation below.', 'warning');
      }

      if (mythExplanationEl) {
        mythExplanationEl.style.display = 'block';
        mythExplanationEl.innerHTML = `<p><strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect!'}</strong> ${q.explanation}</p>`;
      }

      setTimeout(() => {
        currentMythIdx = (currentMythIdx + 1) % MYTH_QUESTIONS.length;
        loadMythQuestion(currentMythIdx);
      }, 3500);
    }
  }

  /* ==========================================================================
     9. "What Should I Do With This Food?" Decision Tree (`quiz.html`)
     ========================================================================== */
  const decisionTypeSelect = document.getElementById('decision-food-type');
  const decisionCondSelect = document.getElementById('decision-condition');
  const decisionResultBox = document.getElementById('decision-result-box');

  if (decisionTypeSelect && decisionCondSelect && decisionResultBox) {
    const updateDecisionTree = () => {
      const type = decisionTypeSelect.value;
      const cond = decisionCondSelect.value;

      let recTitle = '🍽️ Action Recommendation';
      let recText = 'Store properly or consume soon.';

      if (cond === 'questionable') {
        recTitle = '🗑️ DISPOSE SAFELY (Safety First)';
        recText = 'If food shows signs of spoilage, unusual odor, or mold, do not risk foodborne illness. Follow food safety rules: When in doubt, throw it out.';
      } else if (cond === 'excess' && (type === 'unopened_pantry' || type === 'fresh_produce')) {
        recTitle = '🤝 CONSIDER RESPONSIBLE SHARING / DONATION';
        recText = 'Your wholesome surplus food can nourish neighbors or community food pantries! Ensure items are sealed and within safe limits.';
      } else if (type === 'scraps_peels' || cond === 'spooled_scraps') {
        recTitle = '♻️ COMPOST IN BIODEGRADABLE BIN';
        recText = 'Fruit peels, vegetable trimmings, and coffee grounds make rich organic compost. Divert from landfill!';
      } else if (cond === 'fresh_leftover') {
        recTitle = '❄️ REFRIGERATE OR FREEZE IMMEDIATELY';
        recText = 'Store leftovers in airtight containers within 2 hours of cooking. Consume within 3-4 days or freeze for later.';
      }

      decisionResultBox.innerHTML = `
        <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 8px;">${recTitle}</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem;">${recText}</p>
      `;
    };

    decisionTypeSelect.addEventListener('change', updateDecisionTree);
    decisionCondSelect.addEventListener('change', updateDecisionTree);
    updateDecisionTree();
  }

  /* ==========================================================================
     10. Daily Eco Challenge Card (`achievements.html`)
     ========================================================================== */
  const completeChallengeBtn = document.getElementById('complete-challenge-btn');
  const challengeDateKey = new Date().toISOString().slice(0, 10);

  if (completeChallengeBtn) {
    if (GameState.isChallengeCompleted(challengeDateKey)) {
      completeChallengeBtn.textContent = '🎉 Completed Today!';
      completeChallengeBtn.disabled = true;
      completeChallengeBtn.className = 'btn btn-secondary';
    }

    completeChallengeBtn.addEventListener('click', () => {
      GameState.setChallengeCompleted(challengeDateKey);
      GameState.addPoints(15, 'Daily Challenge Completed');
      completeChallengeBtn.textContent = '🎉 Completed Today!';
      completeChallengeBtn.disabled = true;
      completeChallengeBtn.className = 'btn btn-secondary';
      triggerConfetti();
    });
  }

  /* ==========================================================================
     11. Personal Impact Dashboard Calculator (`impact.html`)
     ========================================================================== */
  const impactForm = document.getElementById('impact-calculator-form');
  if (impactForm) {
    const roleSelect = document.getElementById('calc-role-select');
    const countInput = document.getElementById('calc-count-input');
    const wasteSlider = document.getElementById('calc-waste-slider');
    const wasteBadge = document.getElementById('calc-waste-badge');

    const gaugeFill = document.getElementById('gauge-fill-circle');
    const gaugeVal = document.getElementById('gauge-val-text');
    const gaugeLbl = document.getElementById('gauge-lbl-text');

    const statFoodSaved = document.getElementById('stat-food-saved');
    const statMoneySaved = document.getElementById('stat-money-saved');
    const statCo2Saved = document.getElementById('stat-co2-saved');
    const statMealsShared = document.getElementById('stat-meals-shared');

    if (wasteSlider && wasteBadge) {
      wasteSlider.addEventListener('input', (e) => {
        wasteBadge.textContent = `${e.target.value} kg / week`;
        calculateImpact();
      });
    }

    if (roleSelect) roleSelect.addEventListener('change', calculateImpact);
    if (countInput) countInput.addEventListener('change', calculateImpact);

    function calculateImpact() {
      const role = roleSelect ? roleSelect.value : 'student';
      const count = countInput ? parseFloat(countInput.value) || 1 : 1;
      const rawWaste = wasteSlider ? parseFloat(wasteSlider.value) : 2.5;

      let multiplier = 1;
      if (role === 'kitchen') multiplier = 5.0;
      if (role === 'janitor') multiplier = 8.0;

      const weeklyWaste = rawWaste * Math.sqrt(count) * multiplier;
      const annualWasteSaved = Math.round(weeklyWaste * 52 * 0.4); // ~40% reduction target
      const annualMoneySaved = Math.round(annualWasteSaved * 150); // ₱150 per kg food value
      const annualCo2 = Math.round(annualWasteSaved * 2.5); // 2.5 kg CO2e per kg food waste
      const mealsShared = Math.round(annualWasteSaved * 2.2); // ~2.2 meals per kg

      if (gaugeVal) gaugeVal.textContent = `${weeklyWaste.toFixed(1)} kg`;
      if (statFoodSaved) statFoodSaved.textContent = `${annualWasteSaved.toLocaleString()} kg`;
      if (statMoneySaved) statMoneySaved.textContent = `₱${annualMoneySaved.toLocaleString()}`;
      if (statCo2Saved) statCo2Saved.textContent = `${annualCo2.toLocaleString()} kg`;
      if (statMealsShared) statMealsShared.textContent = `${mealsShared.toLocaleString()}`;

      if (gaugeFill) {
        const maxScale = 20 * multiplier;
        const ratio = Math.min(1, weeklyWaste / maxScale);
        const offset = 440 - (440 * ratio);
        gaugeFill.style.strokeDashoffset = offset;

        if (weeklyWaste < 4 * multiplier) {
          gaugeFill.style.stroke = "#10B981"; // Green
          if (gaugeLbl) gaugeLbl.textContent = "Low Impact";
        } else if (weeklyWaste < 10 * multiplier) {
          gaugeFill.style.stroke = "#FACC15"; // Amber
          if (gaugeLbl) gaugeLbl.textContent = "Moderate Impact";
        } else {
          gaugeFill.style.stroke = "#FB7185"; // Coral/Red
          if (gaugeLbl) gaugeLbl.textContent = "High Impact";
        }
      }
    }

    calculateImpact();
  }

  /* Initialize UI State on Page Load */
  updatePointsUI();
  updateRoleUI();
  updateBadgesUI();
});
