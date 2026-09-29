(() => {
  "use strict";
  // Quiz answers never enter analytics, URLs, or a network request.
  const KEY = "tritonai.discoveryQuiz.v1";
  const read = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(KEY));
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  };
  const write = (value) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(value));
      return true;
    } catch { return false; }
  };

  document.querySelectorAll("[data-video-quiz]").forEach((quiz) => {
    const slug = quiz.dataset.videoQuiz;
    const version = quiz.dataset.quizVersion;
    const blocks = Array.from(quiz.querySelectorAll("[data-quiz-block]"));
    const scoreLine = quiz.querySelector("[data-quiz-score]");
    const dialog = quiz.querySelector("dialog");
    const storageNote = quiz.querySelector("[data-quiz-storage]");
    const stored = read()[slug];
    let answers = stored?.version === version && Array.isArray(stored.answers)
      ? blocks.map((block, i) => {
          const value = stored.answers[i];
          const count = block.querySelectorAll("[data-quiz-option]").length;
          return value && Number.isInteger(value.first) && value.first >= 0 && value.first < count && Number.isInteger(value.latest) && value.latest >= 0 && value.latest < count
            ? { first: value.first, latest: value.latest } : null;
        })
      : blocks.map(() => null);
    let trigger;
    const correctIndex = (block) => Number(block.querySelector('[data-quiz-correct="true"]').dataset.quizOption);
    const save = () => {
      const store = read();
      store[slug] = { version, answers, total: blocks.length, updated: Date.now() };
      if (!write(store)) storageNote.textContent = "Browser storage is unavailable. You can take the quiz, but progress will be lost when you leave this page.";
    };
    const render = () => {
      let attempted = 0;
      let firstCorrect = 0;
      blocks.forEach((block, index) => {
        const value = answers[index];
        const right = correctIndex(block);
        const result = block.querySelector("[data-quiz-result]");
        const explanation = block.querySelector("[data-quiz-explanation]");
        block.querySelectorAll("[data-quiz-option]").forEach((option, optionIndex) => {
          const selected = value?.latest === optionIndex;
          option.setAttribute("aria-pressed", String(selected));
          option.classList.toggle("is-correct", selected && optionIndex === right);
          option.classList.toggle("is-incorrect", selected && optionIndex !== right);
        });
        explanation.hidden = !value;
        result.textContent = value ? (value.latest === right ? "Correct." : "Incorrect. Try another answer.") : "";
        result.className = `video-quiz-result${value ? value.latest === right ? " is-correct" : " is-incorrect" : ""}`;
        if (value) {
          attempted += 1;
          if (value.first === right) firstCorrect += 1;
        }
      });
      scoreLine.textContent = attempted === blocks.length
        ? `Quiz complete: ${firstCorrect} of ${blocks.length} correct on the first try. You can review your answers or restart the quiz.`
        : `${attempted} of ${blocks.length} questions answered. ${firstCorrect} correct on the first try.`;
    };
    blocks.forEach((block, index) => {
      block.querySelectorAll("[data-quiz-option]").forEach((option) => {
        option.addEventListener("click", () => {
          const selected = Number(option.dataset.quizOption);
          answers[index] = { first: answers[index]?.first ?? selected, latest: selected };
          save();
          render();
          trigger = option;
          dialog.querySelector("[data-dialog-result]").textContent = selected === correctIndex(block) ? "Correct" : "Incorrect";
          dialog.querySelector("[data-dialog-explanation]").textContent = block.querySelector("[data-quiz-explanation]").textContent;
          if (typeof dialog.showModal === "function") {
            dialog.showModal();
            dialog.querySelector("[data-dialog-result]").focus();
          }
        });
      });
    });
    dialog.querySelector("[data-dialog-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        dialog.querySelector("[data-dialog-close]").focus();
      }
    });
    dialog.addEventListener("close", () => trigger?.focus());
    quiz.querySelector("[data-quiz-reset]").addEventListener("click", () => {
      answers = blocks.map(() => null);
      save();
      render();
      blocks[0].querySelector("[data-quiz-option]").focus();
    });
    render();
    // Detect unavailable storage before the learner starts.
    save();
  });

  const store = read();
  document.querySelectorAll("[data-video-card]").forEach((card) => {
    const entry = store[card.dataset.videoCard];
    const state = card.querySelector("[data-quiz-card-state]");
    if (!state || entry?.version !== card.dataset.quizVersion || !Array.isArray(entry?.answers)) return;
    const attempted = entry.answers.filter(Boolean).length;
    if (!attempted) return;
    state.textContent = attempted === entry.total ? "Knowledge check complete" : `Knowledge check: ${attempted} of ${entry.total} answered`;
    state.hidden = false;
  });
})();
