/* Mazher's birthday surprise — all effects use vanilla JavaScript and CSS. */
(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentPage = 1;
  let cakeTimers = [];
  let quoteTimer = null;
  let audioContext = null;
  let musicOn = false;
  let musicNodes = [];

  // A small, original ambient melody generated with Web Audio. No music file or external asset is required.
  function startMusic() {
    if (musicOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { toast("Your browser does not support background audio."); return; }
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();
      const master = audioContext.createGain();
      master.gain.value = 0.035;
      master.connect(audioContext.destination);
      const notes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
      let index = 0;
      const playNote = () => {
        if (!musicOn) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.value = notes[index % notes.length];
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.6, audioContext.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.05);
        osc.connect(gain); gain.connect(master);
        osc.start(); osc.stop(audioContext.currentTime + 1.1);
        musicNodes.push(osc);
        index++;
      };
      musicOn = true;
      playNote();
      const interval = window.setInterval(() => { if (musicOn) playNote(); else window.clearInterval(interval); }, 720);
      $("#musicToggle").innerHTML = "♫<span class=\"music-label\">Music on</span>";
      $("#musicToggle").setAttribute("aria-label", "Turn music off");
      $("#musicToggle").title = "Music is on";
      $("#musicToggle").dataset.interval = String(interval);
    } catch (error) {
      toast("Audio could not start in this browser.");
    }
  }
  function stopMusic() {
    musicOn = false;
    const interval = Number($("#musicToggle").dataset.interval);
    if (interval) clearInterval(interval);
    musicNodes.forEach(node => { try { node.stop(); } catch (_) {} });
    musicNodes = [];
    $("#musicToggle").innerHTML = "♫<span class=\"music-label\">Music off</span>";
    $("#musicToggle").setAttribute("aria-label", "Turn music on");
    $("#musicToggle").title = "Music is off";
  }
  $("#musicToggle").addEventListener("click", () => musicOn ? stopMusic() : startMusic());

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 2300);
  }

  // Stars and floating decorative elements are generated once for performance.
  function addStars(target, count) {
    const host = $(target);
    if (!host) return;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("i");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      host.appendChild(star);
    }
  }
  function addFloatingHearts(target, count = 12) {
    const host = $(target);
    if (!host) return;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = Math.random() > .5 ? "♥" : "♡";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.bottom = `${-10 - Math.random() * 50}px`;
      heart.style.fontSize = `${10 + Math.random() * 17}px`;
      heart.style.animationDelay = `${Math.random() * 10}s`;
      host.appendChild(heart);
    }
  }
  function addPetals() {
    const host = $("#rosePetals");
    for (let i = 0; i < 24; i++) {
      const petal = document.createElement("span");
      petal.className = "rose-petal";
      petal.textContent = i % 3 === 0 ? "✿" : "❧";
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDelay = `${Math.random() * 12}s`;
      petal.style.fontSize = `${12 + Math.random() * 15}px`;
      host.appendChild(petal);
    }
  }
  addStars("#starField", 90);
  addStars("#cakeStars", 50);
  addStars("#finalSky", 55);
  addFloatingHearts("#heartsOne", 15);
  addPetals();

  // Navigation preserves the one-page-at-a-time cinematic experience.
  function goToPage(pageNumber) {
    const page = Math.max(1, Math.min(5, Number(pageNumber)));
    if (page === currentPage) return;
    $$(".page").forEach(section => section.classList.remove("active"));
    $(`#page-${page}`).classList.add("active");
    currentPage = page;
    $("#pageCount").innerHTML = `${String(page).padStart(2, "0")} <i>/</i> 05`;
    $("#progressFill").style.width = `${page * 20}%`;
    $$(".nav-dot").forEach(dot => dot.classList.toggle("current", Number(dot.dataset.page) === page));
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    if (page === 3) startCakeSequence();
    if (page === 4) startQuotes();
  }
  $$("[data-next]").forEach(button => button.addEventListener("click", () => goToPage(button.dataset.next)));
  $$(".nav-dot").forEach(dot => dot.addEventListener("click", () => {
    const target = Number(dot.dataset.page);
    if (target <= currentPage || target === currentPage + 1) goToPage(target);
    else toast("A little patience, love. Enjoy each chapter in order. ♡");
  }));

  // Page 1: open the gift and reveal the welcome message.
  $("#openGift").addEventListener("click", () => {
    if ($("#giftBox").classList.contains("gift-open")) return;
    $("#giftBox").classList.add("gift-open");
    confettiBurst(85);
    addFloatingHearts("#giftReveal", 18);
    window.setTimeout(() => $("#giftReveal").classList.add("show"), reducedMotion ? 20 : 650);
    $("#openGift").disabled = true;
    $("#openGift").style.opacity = ".35";
  });

  // Page 2: envelope opens, then the letter is typed line by line.
  const letterText = `Dear Mazher,\n\nI don't know how to explain how special you are to me, but I hope this little surprise makes you feel even a fraction of the happiness you bring into my life.\n\nYou are not just someone I care about; you are someone whose happiness genuinely matters to me.\n\nI may not always have the perfect words, but one thing will always remain true: I want to see you smiling, growing, achieving everything you dream of, and becoming the happiest version of yourself.\n\nHappy Birthday, My Love. ❤️`;
  let letterStarted = false;
  $("#envelope").addEventListener("click", () => {
    if (letterStarted) return;
    letterStarted = true;
    $("#envelope").classList.add("open");
    $("#letterHint").style.opacity = "0";
    $("#letterCard").classList.add("visible");
    const output = $("#letterCopy");
    const signature = $(".letter-signature");
    let index = 0;
    const type = () => {
      if (index < letterText.length) {
        output.textContent += letterText[index++];
        window.setTimeout(type, reducedMotion ? 0 : (letterText[index - 1] === "\n" ? 150 : 23));
      } else {
        signature.classList.add("show");
        $("#letterNext").hidden = false;
        $("#letterNext").classList.add("reveal-up");
        confettiBurst(22);
      }
    };
    window.setTimeout(type, reducedMotion ? 0 : 650);
  });

  // Page 3: layers arrive in sequence; the cake is never shown fully assembled at once.
  function clearCakeTimers() { cakeTimers.forEach(clearTimeout); cakeTimers = []; }
  function later(fn, delay) { cakeTimers.push(window.setTimeout(fn, reducedMotion ? Math.min(delay, 40) : delay)); }
  function startCakeSequence() {
    if ($("#cakeBuildStarted").dataset.started === "yes") return;
    $("#cakeBuildStarted").dataset.started = "yes";
    const build = $(".cake-build");
    const status = $("#cakeStatus");
    const steps = [
      ["step-1", "A little sweetness is arriving…"],
      ["step-2", "A second layer, because you deserve extra…"],
      ["step-3", "One more layer of birthday love…"],
      ["step-4", "A soft swirl of frosting and cherries…"],
      ["step-5", "A sprinkle of colour and a little sparkle…"],
      ["step-6", "And now… candles, just for you."]
    ];
    steps.forEach(([className, message], i) => {
      later(() => {
        build.className = `cake-build ${className}`;
        status.textContent = message;
        if (i === 5) {
          $("#cakeScene").classList.add("cake-ready");
          window.setTimeout(() => {
            $("#cakeStatus").textContent = "It's your moment, Mazher. Make it magical.";
            $("#cakeWish").classList.add("show");
          }, reducedMotion ? 50 : 900);
        }
      }, 650 + i * 1150);
    });
    // Decorative sprinkles are placed deterministically around the cake.
    const sprinkleHost = $("#sprinkles");
    for (let i = 0; i < 42; i++) {
      const sprinkle = document.createElement("i");
      sprinkle.className = "sprinkle";
      sprinkle.style.left = `${8 + Math.random() * 84}%`;
      sprinkle.style.top = `${28 + Math.random() * 58}%`;
      sprinkle.style.transform = `rotate(${Math.random() * 180}deg)`;
      sprinkleHost.appendChild(sprinkle);
    }
  }
  $("#blowCandles").addEventListener("click", () => {
    if ($("#cakeMessage").classList.contains("show")) return;
    $$(".flame").forEach((flame, i) => {
      window.setTimeout(() => {
        flame.classList.add("out");
        const smoke = document.createElement("span");
        smoke.className = "smoke";
        flame.parentElement.appendChild(smoke);
      }, reducedMotion ? 0 : i * 170);
    });
    $("#cakeWish").classList.remove("show");
    window.setTimeout(() => {
      $("#cakeMessage").classList.add("show");
      $("#cakeStatus").textContent = "Wish sent. May the universe be listening. ✨";
      confettiBurst(110);
      fireworks();
    }, reducedMotion ? 50 : 1000);
  });

  // Page 4: motivational quote carousel and click-to-open reminder cards.
  const quotes = [
    "“Never doubt your potential. You are capable of achieving things you haven't even imagined yet.”",
    "“I hope this year brings you closer to every dream you've ever worked for.”",
    "“Even on difficult days, remember how far you have already come.”",
    "“Don't be afraid of starting again, growing slowly, or taking a different path.”",
    "“Your journey is yours. Walk at your own pace, but never stop believing in yourself.”",
    "“I want to see you win, not just in life but in every little battle you fight silently.”"
  ];
  let quoteIndex = 0;
  function startQuotes() {
    if (quoteTimer) return;
    const host = $("#quoteStack");
    quoteTimer = window.setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      const p = document.createElement("p");
      p.className = "quote-line";
      p.textContent = quotes[quoteIndex];
      host.replaceChildren(p);
    }, reducedMotion ? 6000 : 3900);
  }
  const birthdayWishes = [
    "May this year surprise you with beautiful beginnings.",
    "May the right doors open, and may you feel brave enough to walk through them.",
    "May your hard work find its way to wonderful opportunities.",
    "May your days hold more laughter, calm mornings, and reasons to feel proud.",
    "May every quiet hope in your heart find a little room to bloom.",
    "May you always have the courage to dream bigger and the peace to enjoy today."
  ];
  $("#generateWish").addEventListener("click", () => {
    const current = $("#generatedWish").textContent;
    const choices = birthdayWishes.filter(wish => wish !== current);
    $("#generatedWish").textContent = choices[Math.floor(Math.random() * choices.length)];
  });

  $$(".reminder-card").forEach(card => {
    card.addEventListener("click", () => {
      const isOpen = card.classList.toggle("expanded");
      card.querySelector(".card-message").textContent = isOpen ? card.dataset.message : "";
      if (isOpen) card.setAttribute("aria-label", `${card.querySelector("strong").textContent}: ${card.dataset.message}`);
    });
  });

  // Confetti and fireworks are temporary DOM elements and clean themselves up.
  function confettiBurst(amount = 60) {
    if (reducedMotion) return;
    const colors = ["#f5a6c7", "#f4d48f", "#b9d5e5", "#e8c4ee", "#fff0df", "#d77da7"];
    for (let i = 0; i < amount; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti";
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.background = colors[i % colors.length];
      bit.style.setProperty("--drift", `${(Math.random() - .5) * 260}px`);
      bit.style.animationDelay = `${Math.random() * .8}s`;
      document.body.appendChild(bit);
      window.setTimeout(() => bit.remove(), 4500);
    }
  }
  function fireworks() {
    if (reducedMotion) return;
    for (let burst = 0; burst < 5; burst++) {
      window.setTimeout(() => {
        const x = 15 + Math.random() * 70, y = 12 + Math.random() * 42;
        for (let i = 0; i < 18; i++) {
          const spark = document.createElement("i");
          spark.className = "confetti";
          spark.style.left = `${x}%`; spark.style.top = `${y}%`;
          spark.style.width = "4px"; spark.style.height = "4px"; spark.style.borderRadius = "50%";
          spark.style.background = ["#ffd68f", "#ff9ec5", "#d5c5f5"][i % 3];
          spark.style.setProperty("--drift", `${Math.cos(i * Math.PI / 9) * 130}px`);
          spark.style.animationDuration = "1.7s";
          document.body.appendChild(spark);
          window.setTimeout(() => spark.remove(), 2200);
        }
      }, burst * 280);
    }
  }

  // Final surprise: fade away the message and reveal a glowing heart.
  function showFinalSurprise() {
    $("#lastSurprisePanel").classList.add("show");
    confettiBurst(100);
    fireworks();
  }
  $("#lastSurprise").addEventListener("click", showFinalSurprise);

  // Replay resets all chapters, interactions, and the automatic cake sequence.
  function replay() {
    stopMusic();
    clearCakeTimers();
    if (quoteTimer) { clearInterval(quoteTimer); quoteTimer = null; }
    quoteIndex = 0;
    letterStarted = false;
    $("#giftBox").classList.remove("gift-open");
    $("#giftReveal").classList.remove("show");
    $("#openGift").disabled = false;
    $("#openGift").style.opacity = "";
    $("#envelope").classList.remove("open");
    $("#letterHint").style.opacity = "";
    $("#letterCard").classList.remove("visible");
    $("#letterCopy").textContent = "";
    $(".letter-signature").classList.remove("show");
    $("#letterNext").hidden = true;
    $("#cakeBuildStarted").dataset.started = "no";
    $(".cake-build").className = "cake-build";
    $("#cakeScene").classList.remove("cake-ready");
    $("#cakeWish").classList.remove("show");
    $("#cakeMessage").classList.remove("show");
    $("#cakeStatus").textContent = "A little sweetness is on its way…";
    $$(".flame").forEach(flame => flame.classList.remove("out"));
    $$(".smoke").forEach(smoke => smoke.remove());
    $$(".reminder-card").forEach(card => { card.classList.remove("expanded"); card.querySelector(".card-message").textContent = ""; });
    $("#lastSurprisePanel").classList.remove("show");
    $("#quoteStack").innerHTML = `<p class="quote-line">${quotes[0]}</p>`;
    $("#generatedWish").textContent = birthdayWishes[0];
    goToPage(1);
  }
  $("#replayButton").addEventListener("click", replay);
  $("#replayButtonFinal").addEventListener("click", replay);

  // Small invisible marker used to ensure the cake sequence only runs once per visit.
  const marker = document.createElement("span");
  marker.id = "cakeBuildStarted";
  marker.dataset.started = "no";
  marker.hidden = true;
  document.body.appendChild(marker);
  // Ensure the cake can be built again after replay, and if the user enters page 3 for the first time.
  const originalGoToPage = goToPage;
  // Initialize progress and keyboard navigation.
  $("#progressFill").style.width = "20%";
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && $("#lastSurprisePanel").classList.contains("show")) $("#lastSurprisePanel").classList.remove("show");
  });
})();
