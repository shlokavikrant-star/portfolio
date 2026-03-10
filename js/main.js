const ready = () => {
  document.body.classList.add("loaded");

  const revealItems = document.querySelectorAll(".scroll-reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 0.05, 0.25)}s`;
      observer.observe(item);
    });
  }

  const transitionLinks = document.querySelectorAll("a[href]");
  transitionLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const isHash = href.startsWith("#");
    const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:");
    const isExternal = link.host && link.host !== window.location.host;

    if (isHash || isMailOrTel || isExternal || link.target === "_blank") return;

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.remove("loaded");
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 220);
    });
  });

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.textContent = "View Project";
  document.body.appendChild(cursor);

  const hoverTargets = document.querySelectorAll(".project-card, .qm-gallery-item");
  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => cursor.classList.add("active"));
    target.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });

  document.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".hero");
  const heroFloatItems = document.querySelectorAll("[data-hero-float]");

  if (hero && heroFloatItems.length && !reduceMotion) {
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let scrollInfluence = 0;

    const updateScrollInfluence = () => {
      const rect = hero.getBoundingClientRect();
      const progress = (window.innerHeight * 0.6 - rect.top) / (window.innerHeight + rect.height);
      scrollInfluence = (Math.max(0, Math.min(1, progress)) - 0.5) * 2;
    };

    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    hero.addEventListener("mouseleave", () => {
      pointerX = 0;
      pointerY = 0;
    });

    window.addEventListener("scroll", updateScrollInfluence, { passive: true });
    updateScrollInfluence();

    const animateHeroFloat = () => {
      currentX += (pointerX - currentX) * 0.06;
      currentY += (pointerY - currentY) * 0.06;

      heroFloatItems.forEach((item) => {
        const speed = Number(item.dataset.floatSpeed || 1);
        const offsetX = currentX * 8 * speed;
        const offsetY = (currentY * 8 + scrollInfluence * 10) * speed;
        item.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
      });

      window.requestAnimationFrame(animateHeroFloat);
    };

    window.requestAnimationFrame(animateHeroFloat);
  }

  if (hero && !reduceMotion) {
    let heroMX = 0;
    let heroMY = 0;
    let heroCurrentX = 0;
    let heroCurrentY = 0;

    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      const rx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ry = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      heroMX = rx * 10;
      heroMY = ry * 8;
    });

    hero.addEventListener("mouseleave", () => {
      heroMX = 0;
      heroMY = 0;
    });

    const animateHeroBackground = () => {
      heroCurrentX += (heroMX - heroCurrentX) * 0.08;
      heroCurrentY += (heroMY - heroCurrentY) * 0.08;
      hero.style.setProperty("--hero-mx", `${heroCurrentX.toFixed(2)}px`);
      hero.style.setProperty("--hero-my", `${heroCurrentY.toFixed(2)}px`);
      window.requestAnimationFrame(animateHeroBackground);
    };

    window.requestAnimationFrame(animateHeroBackground);
  }

  const qmHero = document.querySelector("[data-qm-hero]");
  if (qmHero && !reduceMotion) {
    const updateHeroParallax = () => {
      const rect = qmHero.getBoundingClientRect();
      const centerOffset = rect.top + rect.height * 0.5 - window.innerHeight * 0.5;
      const clamped = Math.max(-120, Math.min(120, centerOffset));
      qmHero.style.setProperty("--qm-hero-parallax", `${(-clamped * 0.09).toFixed(2)}px`);
    };

    updateHeroParallax();
    window.addEventListener("scroll", updateHeroParallax, { passive: true });
    window.addEventListener("resize", updateHeroParallax);
  }

  const galleryItems = Array.from(document.querySelectorAll("[data-qm-gallery-item]"));
  const lightbox = document.querySelector("[data-qm-lightbox]");
  const lightboxImage = document.querySelector("[data-qm-lightbox-image]");
  const closeBtn = document.querySelector("[data-qm-close]");
  const prevBtn = document.querySelector("[data-qm-prev]");
  const nextBtn = document.querySelector("[data-qm-next]");

  if (galleryItems.length && lightbox && lightboxImage && closeBtn && prevBtn && nextBtn) {
    const sources = galleryItems
      .map((item) => item.querySelector("img"))
      .filter(Boolean)
      .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt || "Gallery image" }));

    let activeIndex = 0;
    let touchStartX = 0;

    const updateLightbox = () => {
      const selected = sources[activeIndex];
      if (!selected) return;
      lightboxImage.src = selected.src;
      lightboxImage.alt = selected.alt;
    };

    const openLightbox = (index) => {
      activeIndex = index;
      updateLightbox();
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    const showPrev = () => {
      activeIndex = (activeIndex - 1 + sources.length) % sources.length;
      updateLightbox();
    };

    const showNext = () => {
      activeIndex = (activeIndex + 1) % sources.length;
      updateLightbox();
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index));
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("touchstart", (event) => {
      if (!event.changedTouches.length) return;
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
      if (!event.changedTouches.length) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 50) return;
      if (deltaX > 0) showPrev();
      if (deltaX < 0) showNext();
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    });

    const previewBubble = document.createElement("div");
    previewBubble.className = "qm-preview-bubble";
    document.body.appendChild(previewBubble);

    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!coarsePointer) {
      let hovering = false;

      galleryItems.forEach((item) => {
        const image = item.querySelector("img");
        if (!image) return;

        item.addEventListener("mouseenter", () => {
          hovering = true;
          previewBubble.classList.add("active");
          previewBubble.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
        });

        item.addEventListener("mouseleave", () => {
          hovering = false;
          previewBubble.classList.remove("active");
        });

        item.addEventListener("mousemove", (event) => {
          const rect = item.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          previewBubble.style.backgroundPosition = `${x}% ${y}%`;
        });
      });

      document.addEventListener("mousemove", (event) => {
        if (!hovering) return;
        previewBubble.style.left = `${event.clientX + 28}px`;
        previewBubble.style.top = `${event.clientY + 28}px`;
      });
    }
  }

  const fashionCards = document.querySelectorAll(".fashion-cover-card");
  fashionCards.forEach((card) => {
    const pillText = card.querySelector(".fashion-pill-text");
    if (!pillText) return;

    const defaultText = pillText.dataset.default || pillText.textContent.trim();

    const setPillText = (nextText) => {
      if (pillText.textContent === nextText) return;
      pillText.style.opacity = "0";
      window.setTimeout(() => {
        pillText.textContent = nextText;
        pillText.style.opacity = "1";
      }, 120);
    };

    card.addEventListener("mouseenter", () => setPillText("VIEW PROJECT"));
    card.addEventListener("mouseleave", () => setPillText(defaultText));
    card.addEventListener("focusin", () => setPillText("VIEW PROJECT"));
    card.addEventListener("focusout", () => setPillText(defaultText));
  });

  const isFineArtPage = document.body.classList.contains("fine-art-gallery-page");
  if (isFineArtPage) {
    const fineArtRows = Array.from(document.querySelectorAll(".fa-row"));
    if (fineArtRows.length) {
      const setFocusedRow = (row) => {
        fineArtRows.forEach((item) => item.classList.remove("in-focus"));
        if (row) row.classList.add("in-focus");
      };

      const focusObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]) setFocusedRow(visible[0].target);
        },
        { threshold: [0.35, 0.55, 0.75] }
      );

      fineArtRows.forEach((row) => focusObserver.observe(row));
      setFocusedRow(fineArtRows[0]);
    }
  }

  const isGraphicsExhibitPage = document.body.classList.contains("graphics-exhibit-page");
  if (isGraphicsExhibitPage) {
    const tiltItems = document.querySelectorAll("[data-gx-tilt]");
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!noMotion) {
      tiltItems.forEach((item) => {
        const wrap = item.closest(".gx-poster-wrap");
        if (!wrap) return;

        wrap.addEventListener("mousemove", (event) => {
          const rect = wrap.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          const rotateY = x * 5;
          const rotateX = -y * 5;
          item.style.transform = `translateY(-8px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });

        wrap.addEventListener("mouseleave", () => {
          item.style.transform = "translateY(0) rotateX(0deg) rotateY(0deg)";
        });
      });
    }

    const gxItems = Array.from(document.querySelectorAll("[data-gx-item]"));
    const gxLightbox = document.querySelector("[data-gx-lightbox]");
    const gxLightboxImage = document.querySelector("[data-gx-lightbox-image]");
    const gxClose = document.querySelector("[data-gx-close]");
    const gxPrev = document.querySelector("[data-gx-prev]");
    const gxNext = document.querySelector("[data-gx-next]");

    if (gxItems.length && gxLightbox && gxLightboxImage && gxClose && gxPrev && gxNext) {
      const gxSources = gxItems
        .map((item) => item.querySelector("img"))
        .filter(Boolean)
        .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt || "Poster image" }));

      let gxIndex = 0;

      const gxRender = () => {
        const selected = gxSources[gxIndex];
        if (!selected) return;
        gxLightboxImage.src = selected.src;
        gxLightboxImage.alt = selected.alt;
      };

      const gxOpen = (index) => {
        gxIndex = index;
        gxRender();
        gxLightbox.classList.add("open");
        gxLightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      };

      const gxCloseModal = () => {
        gxLightbox.classList.remove("open");
        gxLightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };

      const gxPrevSlide = () => {
        gxIndex = (gxIndex - 1 + gxSources.length) % gxSources.length;
        gxRender();
      };

      const gxNextSlide = () => {
        gxIndex = (gxIndex + 1) % gxSources.length;
        gxRender();
      };

      gxItems.forEach((item, index) => {
        item.addEventListener("click", () => gxOpen(index));
      });

      gxClose.addEventListener("click", gxCloseModal);
      gxPrev.addEventListener("click", gxPrevSlide);
      gxNext.addEventListener("click", gxNextSlide);

      gxLightbox.addEventListener("click", (event) => {
        if (event.target === gxLightbox) gxCloseModal();
      });

      document.addEventListener("keydown", (event) => {
        if (!gxLightbox.classList.contains("open")) return;
        if (event.key === "Escape") gxCloseModal();
        if (event.key === "ArrowLeft") gxPrevSlide();
        if (event.key === "ArrowRight") gxNextSlide();
      });
    }
  }

  const backBtn = document.getElementById("floatingBack");
  if (backBtn) {
    const toggleBackButton = () => {
      if (window.scrollY > 200) {
        backBtn.classList.add("visible");
      } else {
        backBtn.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", toggleBackButton, { passive: true });
    toggleBackButton();

    backBtn.addEventListener("click", (event) => {
      event.preventDefault();

      if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
      } else {
        window.location.href = "/work.html";
      }
    });
  }

};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
