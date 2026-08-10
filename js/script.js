document.addEventListener('DOMContentLoaded', () => {
  // Remove preload class shortly after DOM ready to enable smooth transition animations
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 60);
  });

  /* ==========================================================================
     1. Theme Management (Dark / Light Mode)
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
      if (theme === 'dark') {
        btn.classList.add('dark-active');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        btn.classList.remove('dark-active');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    });
  }

  /* ==========================================================================
     2. Mobile Navigation Toggle
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      hamburgerBtn.setAttribute('aria-expanded', isExpanded);
      hamburgerBtn.textContent = isExpanded ? 'Close Menu' : 'Menu';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.textContent = 'Menu';
      }
    });
  }

  /* ==========================================================================
     3. Toast Notification Helper System
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
    }, 4000);
  }

  /* ==========================================================================
     4. Animated Counter Metrics (Homepage)
     ========================================================================== */
  const metricNumbers = document.querySelectorAll('.metric-number[data-target]');

  if (metricNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          
          animateCounter(el, target, prefix, suffix, decimals);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    metricNumbers.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(element, target, prefix, suffix, decimals) {
    let start = 0;
    const duration = 1600;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      
      const formattedNum = decimals > 0 
        ? start.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(start).toLocaleString('en-US');

      element.textContent = `${prefix}${formattedNum}${suffix}`;
    }, stepTime);
  }

  /* ==========================================================================
     5. ScrollSpy & Smooth Scroll for Table of Contents (About Page)
     ========================================================================== */
  const tocLinks = document.querySelectorAll('.toc-list a');
  const sections = document.querySelectorAll('article section[id]');

  if (tocLinks.length > 0 && sections.length > 0) {
    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPosition = window.scrollY + 140;

      sections.forEach(section => {
        if (scrollPosition >= section.offsetTop) {
          currentSectionId = section.getAttribute('id');
        }
      });

      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // Mobile Table of Contents Accordion Toggle
  const tocBtn = document.getElementById('toc-accordion-btn');
  const tocContent = document.getElementById('toc-accordion-content');

  if (tocBtn && tocContent) {
    tocBtn.addEventListener('click', () => {
      const isVisible = tocContent.style.display === 'block';
      tocContent.style.display = isVisible ? 'none' : 'block';
      const arrow = tocBtn.querySelector('.arrow');
      if (arrow) {
        arrow.textContent = isVisible ? '▼ Show Menu' : '▲ Hide Menu';
      }
    });
  }

  // Download PDF Guide Simulation
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      showToast('Downloading Food Preservation Guide (PDF)...', 'success');
    });
  }

  /* ==========================================================================
     6. Storage Guide Filter Tabs (About Page)
     ========================================================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanels.forEach(panel => {
          if (targetTab === 'all' || panel.getAttribute('id') === `tab-${targetTab}`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /* ==========================================================================
     7. Expandable Date Label Accordions (About Page)
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  if (accordionHeaders.length > 0) {
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Toggle current item
        item.classList.toggle('active');
        header.setAttribute('aria-expanded', !isActive);
      });
    });
  }

  /* ==========================================================================
     8. Food Waste Impact Calculator Engine (Quiz Page)
     ========================================================================== */
  const quizForm = document.getElementById('food-quiz-form');

  if (quizForm) {
    const householdSelect = document.getElementById('household-select');
    const wasteSlider = document.getElementById('waste-slider');
    const wasteValueBadge = document.getElementById('waste-slider-badge');
    const prepSlider = document.getElementById('prep-slider');
    const prepValueBadge = document.getElementById('prep-slider-badge');
    const resetBtn = document.getElementById('reset-calc-btn');
    const shareBtn = document.getElementById('share-results-btn');

    const gaugeFill = document.getElementById('gauge-fill-circle');
    const gaugeValueDisplay = document.getElementById('gauge-value-display');
    const gaugeLabelDisplay = document.getElementById('gauge-label-display');

    const statWeeklyWaste = document.getElementById('stat-weekly-waste');
    const statAnnualWaste = document.getElementById('stat-annual-waste');
    const statMoneySaved = document.getElementById('stat-money-saved');
    const statCo2Saved = document.getElementById('stat-co2-saved');
    const dynamicTipText = document.getElementById('dynamic-tip-text');
    const progressFill = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.stepper-percentage');

    // Update Slider Badges Real-Time
    if (wasteSlider && wasteValueBadge) {
      wasteSlider.addEventListener('input', (e) => {
        wasteValueBadge.textContent = `${e.target.value} kg / week`;
        updateCalculator();
      });
    }

    if (prepSlider && prepValueBadge) {
      prepSlider.addEventListener('input', (e) => {
        prepValueBadge.textContent = `${e.target.value} Days / week`;
        updateCalculator();
      });
    }

    // Attach listeners to all inputs
    const inputs = quizForm.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', updateCalculator);
    });

    if (householdSelect) householdSelect.addEventListener('change', updateCalculator);

    // Main Calculator Function
    function updateCalculator() {
      // Inputs
      const selectedHouseholdRadio = quizForm.querySelector('input[name="household_size"]:checked');
      const householdCount = selectedHouseholdRadio ? parseInt(selectedHouseholdRadio.value, 10) : (householdSelect ? parseInt(householdSelect.value, 10) : 2);
      
      const rawWasteKg = wasteSlider ? parseFloat(wasteSlider.value) : 2.0;
      const prepDays = prepSlider ? parseInt(prepSlider.value, 10) : 3;

      // Check optional habits
      const compostCheck = quizForm.querySelector('input[name="habit_compost"]');
      const compostBonus = (compostCheck && compostCheck.checked) ? 0.15 : 0;

      // Calculation logic
      const prepEfficiency = 1 - (prepDays * 0.08) - compostBonus;
      const effectivePrepFactor = Math.max(0.4, prepEfficiency);
      
      const weeklyWasteKg = (rawWasteKg * Math.sqrt(householdCount) * effectivePrepFactor);
      const annualWasteKg = Math.round(weeklyWasteKg * 52);
      const annualMoney = Math.round(weeklyWasteKg * 52 * 7.20); // ~$7.20 per kg food value
      const annualCo2 = Math.round(weeklyWasteKg * 52 * 2.5); // ~2.5 kg CO2e per kg food waste

      // Update Metric Display Text
      if (gaugeValueDisplay) gaugeValueDisplay.textContent = `${weeklyWasteKg.toFixed(1)} kg`;
      if (statWeeklyWaste) statWeeklyWaste.textContent = `${weeklyWasteKg.toFixed(1)} kg`;
      if (statAnnualWaste) statAnnualWaste.textContent = `${annualWasteKg} kg`;
      if (statMoneySaved) statMoneySaved.textContent = `$${annualMoney.toLocaleString()}`;
      if (statCo2Saved) statCo2Saved.textContent = `${annualCo2.toLocaleString()} kg`;

      // Update Gauge Ring SVG
      if (gaugeFill) {
        // Full stroke circumference is 440
        // Max expected waste scale ~ 12 kg
        const maxScale = 10;
        const wasteRatio = Math.min(1, weeklyWasteKg / maxScale);
        const offset = 440 - (440 * wasteRatio);
        gaugeFill.style.strokeDashoffset = offset;

        // Change color severity
        if (weeklyWasteKg < 2.0) {
          gaugeFill.style.stroke = "#10b981"; // Green
          if (gaugeLabelDisplay) gaugeLabelDisplay.textContent = "Low Impact";
        } else if (weeklyWasteKg < 4.5) {
          gaugeFill.style.stroke = "#f59e0b"; // Amber
          if (gaugeLabelDisplay) gaugeLabelDisplay.textContent = "Moderate Impact";
        } else {
          gaugeFill.style.stroke = "#ef4444"; // Red
          if (gaugeLabelDisplay) gaugeLabelDisplay.textContent = "High Impact";
        }
      }

      // Update Dynamic Tip
      if (dynamicTipText) {
        if (prepDays < 2) {
          dynamicTipText.textContent = "Planning meals just 2 days a week can reduce your food waste by over 25% and save $300+ annually!";
        } else if (weeklyWasteKg > 4.5) {
          dynamicTipText.textContent = "High waste detected! Try freezing leftovers immediately and creating a 'Use First' shelf in your fridge.";
        } else if (compostBonus > 0) {
          dynamicTipText.textContent = "Great job composting! Pair this with batch cooking to maximize your household sustainability score.";
        } else {
          dynamicTipText.textContent = "Excellent habits! Consider sharing unopened surplus produce with your local community pantry.";
        }
      }

      // Update Progress Bar
      if (progressFill && progressText) {
        let stepCount = 1;
        if (prepDays > 0) stepCount++;
        if (rawWasteKg !== 2.5) stepCount++;
        if (householdCount !== 2) stepCount++;

        const percentage = Math.min(100, Math.max(25, stepCount * 25));
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Complete`;
      }
    }

    // Initialize Calculator on Load
    updateCalculator();

    // Reset Button Handler
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        quizForm.reset();
        if (wasteSlider && wasteValueBadge) {
          wasteSlider.value = 2.5;
          wasteValueBadge.textContent = "2.5 kg / week";
        }
        if (prepSlider && prepValueBadge) {
          prepSlider.value = 3;
          prepValueBadge.textContent = "3 Days / week";
        }
        updateCalculator();
        showToast('Calculator reset to default values', 'info');
      });
    }

    // Share Results Web Share API
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const weekly = statWeeklyWaste ? statWeeklyWaste.textContent : '2.5 kg';
        const money = statMoneySaved ? statMoneySaved.textContent : '$500';
        const shareData = {
          title: 'My Food Waste Impact Assessment',
          text: `I audited my household food waste! I generate ~${weekly}/week and have the potential to save ${money}/year with smart food preservation!`,
          url: window.location.href
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
            showToast('Impact results shared successfully!', 'success');
          } catch (err) {
            // User cancelled share
          }
        } else {
          // Fallback clipboard copy
          try {
            await navigator.clipboard.writeText(`${shareData.title}: ${shareData.text} Check it out: ${shareData.url}`);
            showToast('Results summary copied to clipboard!', 'success');
          } catch (err) {
            showToast('Results summary ready to share!', 'info');
          }
        }
      });
    }
  }

  /* ==========================================================================
     9. Newsletter Subscription Handler (Footer)
     ========================================================================== */
  const newsletterForms = document.querySelectorAll('.footer-newsletter form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() !== '') {
        showToast('Thank you for subscribing to our Food Sustainability Newsletter!', 'success');
        emailInput.value = '';
      } else {
        showToast('Please enter a valid email address.', 'info');
      }
    });
  });
});
