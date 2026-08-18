/* ==========================================================================
   Food Waste Reducer & Sharing Guide — ACD Sustainable Living Initiative
   Comprehensive JavaScript Application & Gamified Interactive Game Engine
   ========================================================================== */

// Safe storage wrapper to prevent file:// protocol SecurityErrors in browsers
const SafeStorage = {
  memory: {},
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return SafeStorage.memory[key] || null;
    }
  },
  setItem: (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      SafeStorage.memory[key] = String(val);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Smooth transition support
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 60);
  });

  /* ==========================================================================
     1. Mobile Drawer Navigation Toggle
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      hamburgerBtn.setAttribute('aria-expanded', isExpanded);
      hamburgerBtn.textContent = isExpanded ? '✕ Close' : '☰ Menu';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== hamburgerBtn) {
        navLinks.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.textContent = '☰ Menu';
      }
    });
  }

  /* ==========================================================================
     2. Gamification State & Point Economy
     ========================================================================== */
  const GameState = {
    getPoints: () => parseInt(SafeStorage.getItem('acd_eco_points') || '0', 10),
    setPoints: (val) => {
      SafeStorage.setItem('acd_eco_points', val);
      updatePointsUI();
    },
    addPoints: (val, reason) => {
      const current = GameState.getPoints();
      const updated = current + val;
      GameState.setPoints(updated);
      showToast(`+${val} Eco Points! ${reason || ''}`, 'success');
      checkLevelAndBadges();
    },
    getRole: () => SafeStorage.getItem('acd_user_role') || 'student',
    setRole: (role) => {
      SafeStorage.setItem('acd_user_role', role);
      updateRoleUI();
    },
    getUnlockedBadges: () => {
      try {
        return JSON.parse(SafeStorage.getItem('acd_unlocked_badges') || '["first_step"]');
      } catch (e) {
        return ["first_step"];
      }
    },
    unlockBadge: (badgeId, badgeName) => {
      const unlocked = GameState.getUnlockedBadges();
      if (!unlocked.includes(badgeId)) {
        unlocked.push(badgeId);
        SafeStorage.setItem('acd_unlocked_badges', JSON.stringify(unlocked));
        showToast(`🏆 Badge Unlocked: ${badgeName}!`, 'success');
        triggerConfetti();
        updateBadgesUI();
      }
    },
    isChallengeCompleted: (dateKey) => SafeStorage.getItem(`acd_challenge_${dateKey}`) === 'true',
    setChallengeCompleted: (dateKey) => {
      SafeStorage.setItem(`acd_challenge_${dateKey}`, 'true');
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
    progressTexts.forEach(el => el.textContent = `${levelInfo.percentage}% to Level ${levelInfo.next.level}`);
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
        card.classList.remove('locked');
        const statusLbl = card.querySelector('.badge-status');
        if (statusLbl) statusLbl.textContent = '✅ Unlocked';
      }
    });
  }

  /* Toast Notification Helper */
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

  /* Celebratory Confetti Emojis */
  function triggerConfetti() {
    const pop = document.createElement('div');
    pop.style.position = 'fixed';
    pop.style.top = '35%';
    pop.style.left = '50%';
    pop.style.transform = 'translate(-50%, -50%)';
    pop.style.fontSize = '4.5rem';
    pop.style.zIndex = '99999';
    pop.style.pointerEvents = 'none';
    pop.textContent = '🎉✨🌱🏆';
    document.body.appendChild(pop);
    setTimeout(() => {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 1400);
  }

  /* ==========================================================================
     3. GAME 1: "SORT IT!" Interactive Waste Sorting Arcade (`quiz.html`)
     ========================================================================== */
  const sortItemsContainer = document.getElementById('draggable-items-container');
  const sortBinCards = document.querySelectorAll('.bin-card[data-category]');
  const sortScoreBadge = document.getElementById('sort-game-score');
  const sortStreakPill = document.getElementById('sort-streak-pill');
  const sortStreakCount = document.getElementById('sort-streak-count');
  const sortCompletionCard = document.getElementById('sort-completion-card');
  const resetSortBtn = document.getElementById('reset-sort-game-btn');

  const ALL_SORT_ITEMS = [
    { id: 's1', name: '🍌 Banana Peel', category: 'biodegradable', hint: 'Organic food scrap' },
    { id: 's2', name: '🥤 Plastic Soda Bottle', category: 'recyclable', hint: 'Rigid clean plastic' },
    { id: 's3', name: '🥫 Canned Sardines Tin', category: 'recyclable', hint: 'Clean metal tin' },
    { id: 's4', name: '🍗 Fried Chicken Bones', category: 'biodegradable', hint: 'Food table scrap' },
    { id: 's5', name: '☕ Used Coffee Grounds', category: 'biodegradable', hint: 'Rich organic compost' },
    { id: 's6', name: '🔋 AA Flashlight Battery', category: 'special', hint: 'Toxic chemical e-waste' },
    { id: 's7', name: '📦 Cardboard Packaging Box', category: 'recyclable', hint: 'Clean corrugated paper' },
    { id: 's8', name: '🥢 Disposable Wood Chopsticks', category: 'biodegradable', hint: 'Untreated natural wood' },
    { id: 's9', name: '🍱 Soiled Styrofoam Container', category: 'residual', hint: 'Non-recyclable contaminated foam' },
    { id: 's10', name: '🥚 Crushed Eggshells', category: 'biodegradable', hint: 'Organic mineral source' },
    { id: 's11', name: '🧴 Empty Bleach Chemical Bottle', category: 'special', hint: 'Hazardous household residue' },
    { id: 's12', name: '🍬 Plastic Snack Foil Wrapper', category: 'residual', hint: 'Multi-layer laminate plastic' }
  ];

  let selectedSortItem = null;
  let sortedScore = 0;
  let sortStreak = 0;
  let binCounts = { biodegradable: 0, recyclable: 0, residual: 0, special: 0 };

  if (sortItemsContainer && sortBinCards.length > 0) {
    initSortGame();

    function initSortGame() {
      sortedScore = 0;
      sortStreak = 0;
      selectedSortItem = null;
      binCounts = { biodegradable: 0, recyclable: 0, residual: 0, special: 0 };

      if (sortCompletionCard) sortCompletionCard.style.display = 'none';
      if (sortStreakPill) sortStreakPill.style.display = 'none';
      updateBinCountsUI();
      updateSortScoreUI();

      // Shuffle items
      const shuffled = [...ALL_SORT_ITEMS].sort(() => 0.5 - Math.random());
      sortItemsContainer.innerHTML = '';

      shuffled.forEach(item => {
        const pill = document.createElement('div');
        pill.className = 'sort-item-pill';
        pill.setAttribute('data-id', item.id);
        pill.setAttribute('data-category', item.category);
        pill.innerHTML = `<span>${item.name}</span>`;

        pill.addEventListener('click', () => {
          document.querySelectorAll('.sort-item-pill').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
          selectedSortItem = item;
          showToast(`Selected "${item.name}". Now click a bin below!`, 'info');
        });

        sortItemsContainer.appendChild(pill);
      });
    }

    function updateSortScoreUI() {
      if (sortScoreBadge) {
        sortScoreBadge.textContent = `🌱 Score: ${sortedScore} / ${ALL_SORT_ITEMS.length}`;
      }
      if (sortStreakPill && sortStreakCount) {
        if (sortStreak >= 2) {
          sortStreakPill.style.display = 'inline-flex';
          sortStreakCount.textContent = sortStreak;
        } else {
          sortStreakPill.style.display = 'none';
        }
      }
    }

    function updateBinCountsUI() {
      Object.keys(binCounts).forEach(cat => {
        const badge = document.getElementById(`count-${cat}`);
        if (badge) {
          badge.textContent = `${binCounts[cat]} sorted`;
        }
      });
    }

    sortBinCards.forEach(bin => {
      bin.addEventListener('click', () => {
        if (!selectedSortItem) {
          showToast('Please click an item above to select it first!', 'warning');
          return;
        }

        const binCategory = bin.getAttribute('data-category');
        const itemEl = sortItemsContainer.querySelector(`[data-id="${selectedSortItem.id}"]`);

        if (binCategory === selectedSortItem.category) {
          // Correct Sort
          sortedScore++;
          sortStreak++;
          binCounts[binCategory]++;
          
          bin.classList.add('flash-success');
          setTimeout(() => bin.classList.remove('flash-success'), 600);

          let bonusPoints = 5;
          if (sortStreak >= 3) bonusPoints += 3;
          GameState.addPoints(bonusPoints, `Correct Sort (${sortStreak}x Streak!)`);

          showToast(`✅ Correct! "${selectedSortItem.name}" belongs in the ${binCategory.toUpperCase()} bin!`, 'success');

          if (itemEl) {
            itemEl.classList.add('sorted-out');
            setTimeout(() => itemEl.remove(), 250);
          }

          selectedSortItem = null;
          updateSortScoreUI();
          updateBinCountsUI();

          // Check Win State
          if (sortedScore === ALL_SORT_ITEMS.length) {
            triggerConfetti();
            GameState.unlockBadge('sorting_pro', 'Sorting Pro');
            GameState.addPoints(25, 'Sort It Mastery Completion');
            if (sortCompletionCard) sortCompletionCard.style.display = 'block';
            showToast('🎉 CONGRATULATIONS! You sorted all waste items correctly!', 'success');
          }

        } else {
          // Incorrect Sort
          sortStreak = 0;
          updateSortScoreUI();

          bin.classList.add('flash-error');
          setTimeout(() => bin.classList.remove('flash-error'), 500);

          showToast(`❌ Incorrect! "${selectedSortItem.name}" does NOT belong in ${binCategory.toUpperCase()}. Hint: ${selectedSortItem.hint}. Try again!`, 'warning');
        }
      });
    });

    if (resetSortBtn) {
      resetSortBtn.addEventListener('click', () => {
        initSortGame();
        showToast('Sorting game reset with shuffled items!', 'info');
      });
    }
  }

  /* ==========================================================================
     4. GAME 2: "MYTH OR FACT?" 8-Question Challenge (`quiz.html`)
     ========================================================================== */
  const MYTH_QUESTIONS = [
    {
      category: 'FOOD SAFETY & EXPIRATION DATES',
      statement: '“All food past its printed \'Best If Used By\' date is automatically toxic and unsafe to eat.”',
      isFact: false,
      explanation: '“Best If Used By” indicates peak flavor and manufacturer quality, NOT a food safety deadline! Most shelf-stable and canned foods remain safe long after this date if unopened and intact.',
      insight: '🌱 ACD Stewardship: Evaluate food using smell, appearance, and texture before throwing wholesome food into the garbage!'
    },
    {
      category: 'FREEZING SCIENCE',
      statement: '“Freezing food halts bacterial growth indefinitely, acting as a natural food pause button.”',
      isFact: true,
      explanation: 'Freezing food below 0°F (-18°C) keeps food safe virtually indefinitely by inactivating microbes and enzymes. While food quality might change slightly over months, it remains safe to eat.',
      insight: '🌱 Practical Action: Freeze leftover rice, bread slices, and cooked dishes to prevent spoilage!'
    },
    {
      category: 'ETHYLENE GAS & STORAGE',
      statement: '“Storing raw onions and potatoes in the same dark pantry basket keeps them both fresher longer.”',
      isFact: false,
      explanation: 'Onions release natural ethylene gas and high moisture, causing nearby potatoes to sprout, soften, and rot much faster! Store them in separate cool, ventilated spaces.',
      insight: '🌱 Kitchen Pro Tip: Separate ethylene producers (apples, bananas, onions) from sensitive veggies.'
    },
    {
      category: 'ENVIRONMENTAL IMPACT',
      statement: '“Food waste rotting in landfills produces methane gas, a greenhouse driver 25x more potent than CO2.”',
      isFact: true,
      explanation: 'When organic food scraps are buried in anaerobic (airless) landfills, decomposing bacteria produce large volumes of methane gas, accelerating global warming.',
      insight: '🌱 Care for Creation: Composting food scraps turns organic matter into rich soil without landfill methane.'
    },
    {
      category: 'SAFE FOOD REHEATING',
      statement: '“Cooked leftovers can be safely left on the kitchen counter at room temperature overnight if covered.”',
      isFact: false,
      explanation: 'The food "Danger Zone" is between 4°C (40°F) and 60°C (140°F), where bacteria multiply rapidly. Perishable cooked food must be refrigerated within 2 hours of cooking.',
      insight: '🌱 Safety Rule: When in doubt, refrigerate promptly to avoid foodborne illness.'
    },
    {
      category: 'SURPLUS FOOD SHARING',
      statement: '“Sharing unopened wholesome surplus food with community pantries honors social responsibility.”',
      isFact: true,
      explanation: 'Food sharing redirects wholesome, edible nutrition directly to neighbors and community members in need, directly reflecting compassion and social responsibility.',
      insight: '🌱 ACD Core Value: Compassion in action ensures edible nutrition never goes to waste.'
    },
    {
      category: 'PLATE WASTE & PORTION CONTROL',
      statement: '“Serving oversized initial meal portions and leaving rice on the plate has zero impact on campus sustainability.”',
      isFact: false,
      explanation: 'Plate waste represents wasted agricultural water, farmer labor, cooking fuel, and disposal costs. Serving sensible portions and getting seconds only when needed reduces canteen waste by up to 40%.',
      insight: '🌱 Student Habit: Clean plates every meal to honor the effort behind every grain of rice.'
    },
    {
      category: 'VEGETABLE REPURPOSING',
      statement: '“Clean vegetable peelings, carrot tops, and celery ends can be boiled into delicious homemade broth.”',
      isFact: true,
      explanation: 'Clean scraps (onion skins, carrot peels, herb stems) simmered in water create an aromatic vegetable stock, turning kitchen scraps into nutritious zero-cost cooking base.',
      insight: '🌱 Zero-Waste Kitchen: Save clean veggie trimmings in a freezer bag until you have enough for soup broth!'
    }
  ];

  let currentMythIdx = 0;
  let mythScore = 0;
  let isMythAnswered = false;

  const mythStatementEl = document.getElementById('myth-statement-text');
  const mythCategoryTag = document.getElementById('myth-category-tag');
  const mythBtnMyth = document.getElementById('myth-btn-myth');
  const mythBtnFact = document.getElementById('myth-btn-fact');
  const mythExplanationBox = document.getElementById('myth-explanation-box');
  const mythFeedbackHeader = document.getElementById('myth-feedback-header');
  const mythFeedbackExplanation = document.getElementById('myth-feedback-explanation');
  const mythFeedbackInsight = document.getElementById('myth-feedback-insight');
  const mythNextBtn = document.getElementById('myth-next-btn');
  const mythProgressBar = document.getElementById('myth-progress-bar');
  const mythProgressLbl = document.getElementById('myth-progress-lbl');
  const mythScorePill = document.getElementById('myth-score-pill');
  const mythQuestionContainer = document.getElementById('myth-question-container');
  const mythSummaryCard = document.getElementById('myth-summary-card');
  const mythFinalScoreText = document.getElementById('myth-final-score-text');
  const mythFinalRewardText = document.getElementById('myth-final-reward-text');
  const restartMythQuizBtn = document.getElementById('restart-myth-quiz-btn');

  if (mythStatementEl && mythBtnMyth && mythBtnFact) {
    loadMythQuestion(0);

    mythBtnMyth.addEventListener('click', () => handleMythSelection(false));
    mythBtnFact.addEventListener('click', () => handleMythSelection(true));

    if (mythNextBtn) {
      mythNextBtn.addEventListener('click', () => {
        currentMythIdx++;
        if (currentMythIdx < MYTH_QUESTIONS.length) {
          loadMythQuestion(currentMythIdx);
        } else {
          showMythQuizSummary();
        }
      });
    }

    if (restartMythQuizBtn) {
      restartMythQuizBtn.addEventListener('click', () => {
        currentMythIdx = 0;
        mythScore = 0;
        if (mythSummaryCard) mythSummaryCard.style.display = 'none';
        if (mythQuestionContainer) mythQuestionContainer.style.display = 'block';
        loadMythQuestion(0);
      });
    }

    function loadMythQuestion(idx) {
      isMythAnswered = false;
      const q = MYTH_QUESTIONS[idx];
      if (!q) return;

      if (mythCategoryTag) mythCategoryTag.textContent = `CATEGORY: ${q.category}`;
      mythStatementEl.textContent = q.statement;
      if (mythExplanationBox) mythExplanationBox.style.display = 'none';

      const progressPct = ((idx + 1) / MYTH_QUESTIONS.length) * 100;
      if (mythProgressBar) mythProgressBar.style.width = `${progressPct}%`;
      if (mythProgressLbl) mythProgressLbl.textContent = `Question ${idx + 1} of ${MYTH_QUESTIONS.length}`;
      if (mythScorePill) mythScorePill.textContent = `🌟 Eco Score: ${mythScore * 10} pts`;

      // Reset buttons state
      mythBtnMyth.disabled = false;
      mythBtnFact.disabled = false;
      mythBtnMyth.style.opacity = '1';
      mythBtnFact.style.opacity = '1';
    }

    function handleMythSelection(userChoseFact) {
      if (isMythAnswered) return;
      isMythAnswered = true;

      const q = MYTH_QUESTIONS[currentMythIdx];
      const isCorrect = (userChoseFact === q.isFact);

      mythBtnMyth.disabled = true;
      mythBtnFact.disabled = true;

      if (isCorrect) {
        mythScore++;
        GameState.addPoints(10, 'Quiz Correct Answer');
        showToast('🎉 Correct Answer! +10 Eco Points', 'success');
        if (mythFeedbackHeader) {
          mythFeedbackHeader.innerHTML = `<span style="color: #10B981;">✅ CORRECT!</span> You know your eco facts!`;
        }
      } else {
        showToast('❌ Not quite! Read the scientific explanation below.', 'warning');
        if (mythFeedbackHeader) {
          mythFeedbackHeader.innerHTML = `<span style="color: #EF4444;">❌ INCORRECT!</span> It was actually a ${q.isFact ? 'FACT' : 'MYTH'}.`;
        }
      }

      if (mythFeedbackExplanation) mythFeedbackExplanation.textContent = q.explanation;
      if (mythFeedbackInsight) mythFeedbackInsight.textContent = q.insight;
      if (mythScorePill) mythScorePill.textContent = `🌟 Eco Score: ${mythScore * 10} pts`;
      if (mythExplanationBox) mythExplanationBox.style.display = 'block';
    }

    function showMythQuizSummary() {
      if (mythQuestionContainer) mythQuestionContainer.style.display = 'none';
      if (mythSummaryCard) {
        mythSummaryCard.style.display = 'block';
        const pct = Math.round((mythScore / MYTH_QUESTIONS.length) * 100);
        if (mythFinalScoreText) {
          mythFinalScoreText.textContent = `You scored ${mythScore} out of ${MYTH_QUESTIONS.length} (${pct}%)!`;
        }
        if (mythFinalRewardText) {
          mythFinalRewardText.textContent = `+${mythScore * 10} Total Eco Points earned on this challenge!`;
        }
      }

      triggerConfetti();
      GameState.unlockBadge('food_saver', 'Food Saver');
    }
  }

  /* ==========================================================================
     5. GAME 3: "STORAGE ZONE MASTER" Placement Game (`quiz.html`)
     ========================================================================== */
  const storageItemsPool = document.getElementById('storage-items-pool');
  const storageZoneCards = document.querySelectorAll('.storage-zone-card[data-zone]');
  const storageFeedbackBox = document.getElementById('storage-feedback-box');
  const storageFeedbackTitle = document.getElementById('storage-feedback-title');
  const storageFeedbackText = document.getElementById('storage-feedback-text');
  const storageScorePill = document.getElementById('storage-score-pill');
  const resetStorageBtn = document.getElementById('reset-storage-game-btn');

  const STORAGE_ITEMS = [
    { id: 'st1', name: '🥛 Whole Milk', correctZone: 'fridge', advice: 'Store on middle/lower fridge shelves under 4°C. Avoid door racks where temperatures fluctuate!' },
    { id: 'st2', name: '🍞 Loaf of Bread', correctZone: 'counter', advice: 'Keep at room temp in a bread box. Never refrigerate bread as cold temperatures accelerate starch retrogradation (staling)!' },
    { id: 'st3', name: '🍌 Yellow Bananas', correctZone: 'counter', advice: 'Keep on open countertop with airflow. Hang from banana tree hooks to avoid bruising!' },
    { id: 'st4', name: '🥘 Cooked Chicken Adobo', correctZone: 'fridge', advice: 'Refrigerate in airtight container within 2 hours of cooking. Consume within 3-4 days!' },
    { id: 'st5', name: '🥩 Raw Pork Chop', correctZone: 'freezer', advice: 'If not cooking within 1-2 days, wrap tightly and freeze at -18°C for safe multi-month storage.' },
    { id: 'st6', name: '🥔 Russet Potatoes', correctZone: 'pantry', advice: 'Store in cool, dark, well-ventilated pantry cabinet away from onions to prevent sprouting.' },
    { id: 'st7', name: '🥬 Fresh Leafy Spinach', correctZone: 'fridge', advice: 'Store unwashed in fridge crisper drawer wrapped in a paper towel to absorb excess moisture.' },
    { id: 'st8', name: '🥚 Fresh Raw Eggs', correctZone: 'fridge', advice: 'Keep in their original carton on a main fridge shelf for steady cold temperature.' }
  ];

  let selectedStorageItem = null;
  let storedCount = 0;

  if (storageItemsPool && storageZoneCards.length > 0) {
    initStorageGame();

    function initStorageGame() {
      storedCount = 0;
      selectedStorageItem = null;
      if (storageFeedbackBox) storageFeedbackBox.style.display = 'none';
      if (storageScorePill) storageScorePill.textContent = `📦 Stored: 0 / ${STORAGE_ITEMS.length}`;

      storageItemsPool.innerHTML = '';
      STORAGE_ITEMS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'storage-item-card';
        card.setAttribute('data-id', item.id);
        card.innerHTML = `<div style="font-size: 1.8rem;">${item.name.split(' ')[0]}</div><strong style="font-size: 0.88rem; display: block; margin-top: 4px;">${item.name.split(' ').slice(1).join(' ')}</strong>`;

        card.addEventListener('click', () => {
          document.querySelectorAll('.storage-item-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedStorageItem = item;
          showToast(`Selected "${item.name}". Now choose where it belongs!`, 'info');
        });

        storageItemsPool.appendChild(card);
      });
    }

    storageZoneCards.forEach(zone => {
      zone.addEventListener('click', () => {
        if (!selectedStorageItem) {
          showToast('Please select a food item above first!', 'warning');
          return;
        }

        const chosenZone = zone.getAttribute('data-zone');
        const itemCard = storageItemsPool.querySelector(`[data-id="${selectedStorageItem.id}"]`);

        if (chosenZone === selectedStorageItem.correctZone) {
          storedCount++;
          GameState.addPoints(10, 'Correct Storage Placement');
          showToast(`✅ Correct Storage Zone!`, 'success');

          if (itemCard) {
            itemCard.classList.remove('selected');
            itemCard.classList.add('resolved');
          }

          if (storageFeedbackBox && storageFeedbackTitle && storageFeedbackText) {
            storageFeedbackBox.style.display = 'block';
            storageFeedbackTitle.innerHTML = `✅ Perfect! ${selectedStorageItem.name}`;
            storageFeedbackText.textContent = selectedStorageItem.advice;
          }

          selectedStorageItem = null;
          if (storageScorePill) storageScorePill.textContent = `📦 Stored: ${storedCount} / ${STORAGE_ITEMS.length}`;

          if (storedCount === STORAGE_ITEMS.length) {
            triggerConfetti();
            GameState.unlockBadge('smart_planner', 'Smart Planner');
            showToast('🏆 Master of Food Storage! All items preserved properly!', 'success');
          }

        } else {
          showToast(`❌ Incorrect zone for ${selectedStorageItem.name}! Try again.`, 'warning');
          if (storageFeedbackBox && storageFeedbackTitle && storageFeedbackText) {
            storageFeedbackBox.style.display = 'block';
            storageFeedbackTitle.innerHTML = `⚠️ Tip for ${selectedStorageItem.name}:`;
            storageFeedbackText.textContent = selectedStorageItem.advice;
          }
        }
      });
    });

    if (resetStorageBtn) {
      resetStorageBtn.addEventListener('click', () => {
        initStorageGame();
        showToast('Storage challenge reset!', 'info');
      });
    }
  }

  /* ==========================================================================
     6. GAME 4: "LEFTOVER RESCUE & RECIPE ADVISOR" (`quiz.html`)
     ========================================================================== */
  const decisionTypeSelect = document.getElementById('decision-food-type');
  const decisionCondSelect = document.getElementById('decision-condition');
  const recipeOutputCard = document.getElementById('recipe-output-card');

  const RECIPE_DATABASE = {
    cooked_rice: {
      fresh_leftover: {
        title: '🍳 Classic Golden Garlic Fried Rice (Sinangag)',
        prepTime: '⏱️ 10 Mins Prep • High Flavor',
        ingredients: ['Day-old cold cooked rice', 'Crushed garlic cloves (6 pcs)', 'Cooking oil', 'Pinch of salt & spring onions'],
        steps: [
          'Break up cold rice grains with wet fingers.',
          'Sauté generous crushed garlic in hot oil until golden brown.',
          'Add rice, season with salt, and toss vigorously on high heat for 5 minutes.',
          'Garnish with toasted garlic chips and green spring onions!'
        ],
        safety: 'Refrigerate leftover rice within 2 hours. Keep max 3 days in fridge or freeze.'
      },
      excess: {
        title: '🤝 Rice Pudding (Arroz con Leche) / Share Extra Batch',
        prepTime: '⏱️ 20 Mins • Sweet Treat',
        ingredients: ['Extra cooked rice', 'Evaporated milk', 'Sugar', 'Cinnamon stick & raisins'],
        steps: [
          'Simmer cooked rice with milk and cinnamon stick on low heat.',
          'Stir continuously until thick and creamy.',
          'Portion into small bowls and share with family or neighbors!'
        ],
        safety: 'Safe to freeze in pre-portioned containers for up to 2 months.'
      },
      few_days: {
        title: '🥣 Savory Quick Arroz Caldo / Lugaw',
        prepTime: '⏱️ 15 Mins • Comfort Food',
        ingredients: ['Chilled cooked rice', 'Ginger strips', 'Garlic', 'Chicken or vegetable broth'],
        steps: [
          'Sauté ginger and garlic until fragrant.',
          'Pour in broth and add the cold rice.',
          'Simmer while whisking to break down grains into a silky, warming porridge.'
        ],
        safety: 'Ensure reheated porridge reaches a rolling boil (>74°C / 165°F).'
      },
      questionable: {
        title: '🗑️ DISPOSE SAFELY TO BIODEGRADABLE COMPOST',
        prepTime: '⚠️ Food Safety Warning',
        ingredients: ['Do NOT consume fermented or slimy rice'],
        steps: [
          'Bacillus cereus bacteria in spoiled rice produce heat-stable toxins that cooking cannot destroy.',
          'Place spoiled rice into the green BIODEGRADABLE compost bin.'
        ],
        safety: 'When in doubt, throw it out! Never risk food poisoning.'
      }
    },
    overripe_bananas: {
      fresh_leftover: {
        title: '🍌 Golden 3-Ingredient Banana Pancakes',
        prepTime: '⏱️ 12 Mins • Zero Added Sugar',
        ingredients: ['2 Overripe Bananas', '2 Eggs', '1/2 cup Rolled Oats'],
        steps: [
          'Mash bananas in a bowl with a fork until smooth.',
          'Whisk in eggs and rolled oats to form a batter.',
          'Ladle small pancakes onto a greased nonstick pan for 2 mins each side.'
        ],
        safety: 'Dark brown bananas have maximum sweetness and are ideal for cooking!'
      },
      excess: {
        title: '🥤 Frozen Banana Smoothie Cubes',
        prepTime: '⏱️ 5 Mins • Zero Waste Prep',
        ingredients: ['Excess bananas', 'Freezer container'],
        steps: [
          'Peel bananas and slice into 1-inch discs.',
          'Freeze on a flat tray, then transfer into an airtight freezer bag.',
          'Blend straight from freezer with milk for instant thick smoothies!'
        ],
        safety: 'Frozen bananas last 6 months in freezer.'
      },
      few_days: {
        title: '🍞 Moist Classic Banana Bread',
        prepTime: '⏱️ 45 Mins • Bakery Favorite',
        ingredients: ['3-4 very ripe bananas', 'Flour', 'Butter/Oil', 'Sugar & baking soda'],
        steps: [
          'Combine mashed bananas with wet and dry ingredients.',
          'Bake in a loaf pan at 175°C (350°F) for 50 minutes until golden.'
        ],
        safety: 'Safe to store in fridge for 5 days or freeze slices.'
      },
      questionable: {
        title: '♻️ COMPOST BANANA PEELS & SPOILED FRUIT',
        prepTime: 'Compost Bin',
        ingredients: ['Green Biodegradable Bin'],
        steps: [
          'If mold or fruit flies are present, divert directly to the biodegradable bin.',
          'Rich in potassium for healthy garden compost.'
        ],
        safety: 'Always inspect fruit surfaces for fungal growth.'
      }
    },
    stale_bread: {
      fresh_leftover: {
        title: '🥖 Crispy Garlic & Herb Herb Croutons',
        prepTime: '⏱️ 10 Mins • Crunchy Salad Topper',
        ingredients: ['Stale bread slices / Pan de sal', 'Olive oil or butter', 'Garlic powder & dried herbs'],
        steps: [
          'Cut stale bread into 1/2-inch cubes.',
          'Toss with oil, garlic powder, salt, and oregano.',
          'Toast in a dry skillet or toaster oven until deeply golden and crunchy.'
        ],
        safety: 'Store croutons in an airtight jar at room temp for 2 weeks.'
      },
      excess: {
        title: '🍮 Sweet Caramel Bread Pudding',
        prepTime: '⏱️ 35 Mins • Classic Dessert',
        ingredients: ['Stale bread cubes', 'Milk', 'Eggs', 'Sugar & vanilla'],
        steps: [
          'Soak stale bread in milk, beaten eggs, sugar, and vanilla.',
          'Bake in an oven dish until custardy and golden on top.'
        ],
        safety: 'Refrigerate bread pudding and consume within 3 days.'
      },
      few_days: {
        title: '🍞 Homemade Seasoned Breadcrumbs',
        prepTime: '⏱️ 8 Mins • Pantry Staple',
        ingredients: ['Dry stale bread', 'Blender / Food processor'],
        steps: [
          'Toast stale bread cubes until completely dry.',
          'Pulse in blender until fine crumbs form. Use for coating chicken or meatballs!'
        ],
        safety: 'Keeps 3 months in airtight jar in the pantry.'
      },
      questionable: {
        title: '🗑️ DISPOSE MOLDY BREAD (Safety First)',
        prepTime: '⚠️ Mold Danger',
        ingredients: ['Green / White Moldy Bread'],
        steps: [
          'Mold on porous bread sends microscopic roots deep throughout the loaf. Do NOT just cut off the moldy spot.',
          'Discard entire moldy bread into compost/biodegradable waste.'
        ],
        safety: 'Inhaling or consuming bread mold can trigger respiratory reactions and toxicity.'
      }
    },
    veggie_scraps: {
      fresh_leftover: {
        title: '🥕 Rich Homemade Vegetable Scrap Broth',
        prepTime: '⏱️ 30 Mins • Zero Cost',
        ingredients: ['Clean carrot peelings', 'Onion tops & skins', 'Celery ends', 'Garlic skins & water'],
        steps: [
          'Collect clean veggie trimmings in a pot and cover with water.',
          'Simmer on medium heat with bay leaf and black peppercorns for 30 mins.',
          'Strain out solids into compost; use rich golden broth for soups and sauces!'
        ],
        safety: 'Refrigerate broth up to 5 days or freeze in ice cube trays for months.'
      },
      excess: {
        title: '🪴 Regrow Scraps in Water (Kitchen Science)',
        prepTime: '⏱️ Ongoing • Living Kitchen',
        ingredients: ['Green onion roots', 'Celery base', 'Water container'],
        steps: [
          'Place the root base of green onions or celery in a shallow dish of water on a sunny windowsill.',
          'Watch fresh green shoots sprout within days for endless free garnishes!'
        ],
        safety: 'Change water every 2 days to keep roots fresh.'
      },
      few_days: {
        title: '♻️ ENRICH GARDEN COMPOST',
        prepTime: 'Compost Bin',
        ingredients: ['Vegetable scraps & peels'],
        steps: [
          'Divert all clean vegetable trimmings into your organic compost bin.',
          'Provides vital nitrogen and moisture for soil microorganisms.'
        ],
        safety: 'Avoid adding oily or heavily salted scraps to backyard compost.'
      },
      questionable: {
        title: '♻️ BIODEGRADABLE WASTE STREAM',
        prepTime: 'Compost Bin',
        ingredients: ['Decomposing scraps'],
        steps: ['Sort directly into biodegradable bin for organic decomposition.'],
        safety: 'Wash hands after handling spoiled produce.'
      }
    },
    cooked_meat: {
      fresh_leftover: {
        title: '🌮 Shredded Chicken Flakes / Quick Tacos',
        prepTime: '⏱️ 10 Mins • Protein Boost',
        ingredients: ['Leftover cooked chicken/meat', 'Onions', 'Taco seasoning / Soy & calamansi'],
        steps: [
          'Shred cooked meat finely with two forks.',
          'Sauté with chopped onions and seasonings for 4 minutes until sizzling hot.',
          'Serve in tortillas, pandesal sliders, or over steamed rice!'
        ],
        safety: 'Reheat meat thoroughly until steaming hot (>74°C / 165°F).'
      },
      excess: {
        title: '🤝 Pack & Freeze Wholesome Portions',
        prepTime: '⏱️ 5 Mins • Meal Prep',
        ingredients: ['Wholesome cooked meat', 'Freezer bags'],
        steps: [
          'Divide extra cooked meat into single-meal portions.',
          'Label with date and freeze immediately. Thaw only what you need!'
        ],
        safety: 'Cooked meat freezes safely for up to 3 months.'
      },
      few_days: {
        title: '🥘 Hearty Sautéed Leftover Meat Fried Noodles (Pancit)',
        prepTime: '⏱️ 15 Mins • Quick Dinner',
        ingredients: ['Leftover meat', 'Noodles', 'Shredded cabbage', 'Soy sauce'],
        steps: [
          'Sauté garlic, onions, and shredded leftover meat.',
          'Add vegetables, broth, and noodles until sauce is absorbed.'
        ],
        safety: 'Consume refrigerated cooked meat within 3-4 days maximum.'
      },
      questionable: {
        title: '🗑️ DISPOSE SAFELY (Prevent Foodborne Illness)',
        prepTime: '⚠️ Danger',
        ingredients: ['Sour / Slimy Meat'],
        steps: [
          'Spoiled meat can harbor dangerous pathogens like Salmonella and E. coli.',
          'Seal in a bag and dispose into residual or municipal organic waste.'
        ],
        safety: 'Never taste meat that has a sour smell or sticky surface.'
      }
    },
    canned_goods: {
      fresh_leftover: {
        title: '🤝 DONATE TO COMMUNITY PANTRY',
        prepTime: 'Social Responsibility',
        ingredients: ['Unopened canned beans, fish, or vegetables'],
        steps: [
          'Verify that cans are unexpired and have no dents, rust, or swelling.',
          'Donate to your nearest Assumption College of Davao community pantry point!'
        ],
        safety: 'Canned foods provide safe, long-lasting nutrition for families in need.'
      },
      excess: {
        title: '🍲 Quick Protein-Packed Pantry Stew',
        prepTime: '⏱️ 15 Mins • Pantry Meal',
        ingredients: ['Canned beans / tuna', 'Tomato sauce', 'Garlic & onions'],
        steps: [
          'Sauté garlic and onions in a pot.',
          'Pour in canned beans and tomato sauce, simmering for 10 minutes.'
        ],
        safety: 'Once opened, transfer leftover canned food into glass/plastic containers.'
      },
      few_days: {
        title: '📦 Rotate via FIFO (First In, First Out)',
        prepTime: 'Pantry Organization',
        ingredients: ['Pantry canned goods'],
        steps: [
          'Move older canned goods to the front of your pantry shelf.',
          'Place newly purchased items at the back so you use older goods first!'
        ],
        safety: 'FIFO ensures zero canned food expires unnoticed.'
      },
      questionable: {
        title: '⚠️ DISPOSE SWOLLEN / DENTED CANS',
        prepTime: 'Botulism Warning',
        ingredients: ['Bulging / Leaking Can'],
        steps: [
          'Bulging cans indicate gas produced by Clostridium botulinum bacteria.',
          'Do NOT open or taste. Discard safely into residual waste.'
        ],
        safety: 'Botulinum toxin is extremely potent. Never consume from bulging cans.'
      }
    }
  };

  if (decisionTypeSelect && decisionCondSelect && recipeOutputCard) {
    function updateRecipeAdvisor() {
      const foodType = decisionTypeSelect.value;
      const cond = decisionCondSelect.value;

      const foodCategory = RECIPE_DATABASE[foodType] || RECIPE_DATABASE['cooked_rice'];
      const recipeData = foodCategory[cond] || foodCategory['fresh_leftover'];

      let stepsHtml = '';
      if (recipeData.steps && recipeData.steps.length > 0) {
        stepsHtml = `
          <h5 style="margin: 14px 0 6px; color: var(--dark-green);">👨‍🍳 Action Steps:</h5>
          <ol style="margin-left: 20px; font-size: 0.92rem; line-height: 1.5; color: var(--text);">
            ${recipeData.steps.map(step => `<li style="margin-bottom: 4px;">${step}</li>`).join('')}
          </ol>
        `;
      }

      let ingrHtml = '';
      if (recipeData.ingredients && recipeData.ingredients.length > 0) {
        ingrHtml = `
          <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 10px;">
            <strong>Ingredients:</strong> ${recipeData.ingredients.join(' • ')}
          </div>
        `;
      }

      recipeOutputCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
          <h3 style="color: var(--primary); font-size: 1.25rem;">${recipeData.title}</h3>
          <span style="font-size: 0.82rem; font-weight: 700; background: var(--light-green); color: var(--dark-green); padding: 3px 10px; border-radius: var(--radius-full);">${recipeData.prepTime}</span>
        </div>
        ${ingrHtml}
        ${stepsHtml}
        <div style="margin-top: 14px; padding: 10px 14px; background: var(--background); border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--dark-green); border-left: 3px solid var(--primary);">
          <strong>💡 Safety &amp; Storage Tip:</strong> ${recipeData.safety}
        </div>
      `;
    }

    decisionTypeSelect.addEventListener('change', updateRecipeAdvisor);
    decisionCondSelect.addEventListener('change', updateRecipeAdvisor);
    updateRecipeAdvisor();
  }

  /* ==========================================================================
     7. Homepage Food Waste Journey Lifecycle Tabs (`index.html`)
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
      ctaUrl: 'about.html#storage'
    },
    prepare: {
      title: '🥘 PREPARE — Smart Portion Prep',
      text: 'Practice FIFO (First In, First Out) in your kitchen. Use trimming techniques to minimize food scrap waste, and adjust batch preparation to actual diner counts.',
      ctaText: 'View Kitchen Prep Tips →',
      ctaUrl: 'about.html#kitchen'
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
      ctaText: 'Try Storage Game →',
      ctaUrl: 'quiz.html#storage-challenge'
    },
    share: {
      title: '🤝 SHARE — Surplus Redistribution',
      text: 'If you have excess unopened pantry goods or extra wholesome meals, share them with neighbors, community pantries, or campus redistribution points.',
      ctaText: 'Learn Food Sharing Rules →',
      ctaUrl: 'about.html#community'
    },
    compost: {
      title: '♻️ COMPOST / DISPOSE — Circular Stewardship',
      text: 'Segregate organic scraps (peels, cores, grounds) into biodegradable compost bins. Keep inorganic recyclables separated to care for creation.',
      ctaText: 'Play "Sort It!" Game →',
      ctaUrl: 'quiz.html#sort-it'
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

  /* Role Selection on Homepage */
  const roleCards = document.querySelectorAll('.role-card[data-role]');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedRole = card.getAttribute('data-role');
      GameState.setRole(selectedRole);
      roleCards.forEach(c => c.classList.remove('active-role'));
      card.classList.add('active-role');
      showToast(`Selected Role: ${selectedRole.toUpperCase()}!`, 'success');
      
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

  /* Initialize User State on Page Load */
  updatePointsUI();
  updateRoleUI();
  updateBadgesUI();
});
