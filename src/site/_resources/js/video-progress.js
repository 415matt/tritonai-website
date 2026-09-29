(() => {
  "use strict";
  const KEY = "tritonai.videoProgress.v1";
  const read = () => {
    try {
      return JSON.parse(window.localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  const write = (data) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: progress features simply stay off */
    }
  };
  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  // Analytics ride the site's canonical GA tag; it only collects on the
  // production domain, so staging and local previews send nothing.
  const track = (name, params) => {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  };

  document.querySelectorAll(".training-video-follow-details").forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;
    const updateLabel = () => {
      summary.textContent = details.open ? "Hide transcript" : "Show transcript";
    };
    updateLabel();
    details.addEventListener("toggle", updateLabel);
  });

  // --- Detail page: resume, progress saving, transcript seeking ---
  document.querySelectorAll("video[data-progress-slug]").forEach((video) => {
    const slug = video.dataset.progressSlug;
    const saved = read()[slug];
    const playButton = video.parentElement.querySelector("[data-video-play]");
    const playLabel = playButton && playButton.querySelector("[data-video-play-label]");
    const updatePlayButton = () => {
      if (!playButton) return;
      playButton.hidden = !video.paused;
      if (playLabel) {
        playLabel.textContent = video.ended ? "Replay video" : video.currentTime > 0 ? "Resume video" : "Play video";
      }
    };
    if (playButton) {
      playButton.hidden = false;
      playButton.addEventListener("click", () => {
        if (video.ended) video.currentTime = 0;
        const played = video.play();
        if (played && played.catch) {
          played.catch(() => {
            updatePlayButton();
            video.focus();
          });
        }
      });
      video.addEventListener("play", updatePlayButton);
      video.addEventListener("pause", updatePlayButton);
      video.addEventListener("ended", updatePlayButton);
    }
    const revealPostVideo = ({ scroll = false } = {}) => {
      document.querySelectorAll("[data-post-video]").forEach((section) => {
        section.hidden = false;
      });
      if (!scroll) return;
      const target =
        document.querySelector("[data-post-video].video-quiz-section") ||
        document.querySelector("[data-post-video]");
      if (target) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    };
    if (saved && saved.completed) revealPostVideo();
    const resumeHost = document.querySelector(`[data-resume-for="${CSS.escape(slug)}"]`);
    if (resumeHost && saved && !saved.completed && saved.seconds > 15) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary video-resume-button";
      button.textContent = `Resume from ${formatTime(saved.seconds)}`;
      button.addEventListener("click", () => {
        video.currentTime = saved.seconds;
        const played = video.play();
        if (played && played.catch) played.catch(() => {});
        track("video_resume_click", { video_slug: slug, resume_seconds: saved.seconds });
        button.remove();
        video.focus();
      });
      resumeHost.append(button);
    }
    const save = () => {
      const seconds = video.currentTime;
      if (!seconds) return;
      const store = read();
      const finished = video.duration && video.duration - seconds < 10;
      store[slug] = {
        seconds: finished ? 0 : Math.floor(seconds),
        duration: Math.floor(video.duration || 0),
        completed: finished || Boolean(store[slug] && store[slug].completed && seconds < 15),
        title: video.dataset.progressTitle || slug,
        href: window.location.pathname,
        updated: Date.now(),
      };
      write(store);
    };
    const eventBase = () => ({
      video_slug: slug,
      video_title: video.dataset.progressTitle || slug,
      video_duration: Math.floor(video.duration || 0),
      resumed_session: Boolean(saved && saved.seconds > 15),
    });
    let started = false;
    const quartilesSent = new Set();
    video.addEventListener("play", () => {
      if (!started) {
        started = true;
        track("video_start", eventBase());
      }
    });
    let lastSave = 0;
    video.addEventListener("timeupdate", () => {
      const now = Date.now();
      if (now - lastSave > 5000) {
        lastSave = now;
        save();
      }
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        [25, 50, 75].forEach((quartile) => {
          if (percent >= quartile && !quartilesSent.has(quartile)) {
            quartilesSent.add(quartile);
            track("video_progress", { ...eventBase(), percent: quartile });
          }
        });
      }
    });
    video.addEventListener("pause", save);
    video.addEventListener("ended", () => {
      save();
      track("video_complete", eventBase());
      revealPostVideo({ scroll: true });
    });
    if (video.textTracks && video.textTracks.length) {
      let lastMode = video.textTracks[0].mode;
      video.textTracks.addEventListener("change", () => {
        const mode = video.textTracks[0].mode;
        if (mode !== lastMode) {
          lastMode = mode;
          track("video_captions_toggle", { ...eventBase(), captions_on: mode === "showing" });
        }
      });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") save();
    });

    // Follow-along transcript: click any sentence to play from it, and keep
    // the sentence being spoken highlighted while the video plays.
    const sentences = Array.from(
      document.querySelectorAll(`[data-seek][data-seek-target="${CSS.escape(slug)}"]`),
    );
    sentences.forEach((sentence) => {
      sentence.addEventListener("click", () => {
        video.currentTime = Number(sentence.dataset.seek) || 0;
        const played = video.play();
        if (played && played.catch) played.catch(() => {});
        track("video_transcript_seek", { video_slug: slug, seek_seconds: Number(sentence.dataset.seek) || 0 });
      });
    });
    const followRegion = document.querySelector(`[data-follow-for="${CSS.escape(slug)}"]`);
    if (followRegion && sentences.length) {
      const starts = sentences.map((sentence) => Number(sentence.dataset.seek) || 0);
      let activeIndex = -1;
      const highlight = () => {
        const now = video.currentTime;
        let index = -1;
        for (let i = 0; i < starts.length; i += 1) {
          if (now >= starts[i]) index = i;
          else break;
        }
        if (index === activeIndex) return;
        if (activeIndex >= 0) sentences[activeIndex].classList.remove("is-current");
        activeIndex = index;
        if (index >= 0) {
          const current = sentences[index];
          current.classList.add("is-current");
          if (!video.paused) {
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            current.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
          }
        }
      };
      video.addEventListener("timeupdate", highlight);
      video.addEventListener("seeked", highlight);
    }
  });

  // --- Index page: continue-watching strip and per-card state chips ---
  const store = read();
  const strip = document.querySelector("[data-continue-watching]");
  if (strip) {
    const availableSlugs = new Set(Array.from(document.querySelectorAll('[data-video-card][data-video-available="true"]')).map((card) => card.dataset.videoCard));
    const items = Object.entries(store)
      .map(([slug, entry]) => ({ slug, ...entry }))
      .filter((entry) => availableSlugs.has(entry.slug) && !entry.completed && entry.seconds > 15 && entry.href && entry.title)
      .sort((a, b) => b.updated - a.updated)
      .slice(0, 4);
    const list = strip.querySelector("ul");
    if (items.length) {
      items.forEach((entry) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = entry.href;
        link.textContent = `${entry.title} — resume from ${formatTime(entry.seconds)}`;
        item.append(link);
        list.append(item);
      });
      strip.hidden = false;
    } else {
      // Nothing mid-play, but a returning viewer who finished their last
      // video should land on the next unwatched one, not back at square one.
      const cards = Array.from(document.querySelectorAll('[data-video-card][data-video-available="true"]'));
      const finishedAny = cards.some((card) => store[card.dataset.videoCard] && store[card.dataset.videoCard].completed);
      const nextCard = finishedAny
        ? cards.find((card) => !store[card.dataset.videoCard] || !store[card.dataset.videoCard].completed)
        : null;
      if (nextCard) {
        const title = nextCard.querySelector("h3 a");
        if (title) {
          const label = strip.querySelector("[data-continue-label]");
          if (label) label.textContent = "Welcome back";
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = title.getAttribute("href");
          link.textContent = `Up next for you: ${title.textContent}`;
          item.append(link);
          list.append(item);
          strip.hidden = false;
        }
      }
    }
  }
  document.querySelectorAll("[data-video-card]").forEach((card) => {
    const entry = store[card.dataset.videoCard];
    const chip = card.querySelector("[data-video-state]");
    if (!entry || !chip || card.dataset.videoAvailable === "false") return;
    if (entry.completed) {
      chip.textContent = " · Watched";
      chip.hidden = false;
    } else if (entry.seconds > 15) {
      chip.textContent = ` · In progress, ${formatTime(entry.seconds)}`;
      chip.hidden = false;
    }
  });
})();
