// ========================================
// GLOBAL VARIABLES
// ========================================
let isLoaded = false;
let scene, camera, renderer, particles;
let mouseX = 0,
  mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// ========================================
// PRELOADER
// ========================================
window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader");
  const loadingProgress = document.querySelector(".loading-progress");

  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);

      setTimeout(() => {
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
          isLoaded = true;
          initializeAnimations();
        }, 500);
      }, 300);
    }
    loadingProgress.style.width = progress + "%";
  }, 100);
});

// ========================================
// CUSTOM CURSOR
// ========================================
function initCustomCursor() {
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  if (!cursor) return;

  let mouseX = 0,
    mouseY = 0;
  let cursorX = 0,
    cursorY = 0;
  let ringX = 0,
    ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    ringX += (mouseX - ringX) * 0.05;
    ringY += (mouseY - ringY) * 0.05;

    cursorDot.style.left = cursorX + "px";
    cursorDot.style.top = cursorY + "px";
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover effects
  const hoverElements = document.querySelectorAll(
    "a, button, .portfolio-item, .skill-item"
  );
  hoverElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursorRing.style.transform = "translate(-50%, -50%) scale(1.5)";
    });

    element.addEventListener("mouseleave", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
      cursorRing.style.transform = "translate(-50%, -50%) scale(1)";
    });
  });
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  navToggle?.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  // Active link highlighting
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("data-section") === sectionId) {
            link.classList.add("active");
          }
        });
      }
    });
  });
}

// ========================================
// THREE.JS BACKGROUND
// ========================================
function initThreeJS() {
  const container = document.getElementById("bg-particles");
  if (!container) return;

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Particles
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorPalette = [
    new THREE.Color(0x16a34a), // Primary green
    new THREE.Color(0x22c55e), // Primary light green
    new THREE.Color(0x0ea5e9), // Secondary blue
    new THREE.Color(0x8b5cf6), // Accent purple
    new THREE.Color(0xf59e0b), // Accent amber
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 3 + 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Add floating animation
                mvPosition.y += sin(time + position.x * 0.01) * 10.0;
                mvPosition.x += cos(time + position.y * 0.01) * 5.0;
                
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
    fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                if (r > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, r);
                gl_FragColor = vec4(vColor, alpha * 0.6);
            }
        `,
    transparent: true,
    vertexColors: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  camera.position.z = 50;

  // Mouse interaction
  document.addEventListener("mousemove", onDocumentMouseMove, false);

  // Resize handler
  window.addEventListener("resize", onWindowResize, false);

  animate();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.0005;
  mouseY = (event.clientY - windowHalfY) * 0.0005;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (particles) {
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;

    // Mouse interaction
    particles.rotation.x += mouseY * 0.1;
    particles.rotation.y += mouseX * 0.1;

    // Update time uniform
    particles.material.uniforms.time.value += 0.01;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ========================================
// TYPING ANIMATION
// ========================================
function initTypingAnimation() {
  const typingElement = document.querySelector(".typing-text");
  if (!typingElement) return;

  const texts = [
    "Data Analyst",
    "Python Developer",
    "Power BI Expert",
    "SQL Specialist",
    "Problem Solver",
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 150;

  function typeText() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      typingElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 75;
    } else {
      typingElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 150;
    }

    if (!isDeleting && charIndex === currentText.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 500; // Pause before next word
    }

    setTimeout(typeText, typeSpeed);
  }

  typeText();
}

// ========================================
// COUNTER ANIMATION
// ========================================
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat-number");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute("data-count"));
        let current = 0;
        const increment = target / 50;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = Math.floor(current);
        }, 50);

        observer.unobserve(counter);
      }
    });
  });

  counters.forEach((counter) => observer.observe(counter));
}

// ========================================
// GSAP ANIMATIONS
// ========================================
function initGSAPAnimations() {
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded, skipping animations");
    return;
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  const tl = gsap.timeline({ delay: 0.5 });
  tl.from(".hero-greeting", { opacity: 0, y: 30, duration: 0.8 })
    .from(
      ".hero-name .name-part",
      { opacity: 0, y: 50, duration: 0.8, stagger: 0.2 },
      "-=0.6"
    )
    .from(".hero-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
    .from(".hero-description", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
    .from(
      ".hero-buttons .btn",
      { opacity: 0, y: 30, duration: 0.8, stagger: 0.1 },
      "-=0.4"
    )
    .from(
      ".hero-social .social-link",
      { opacity: 0, scale: 0, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    )
    .from(".hero-visual", { opacity: 0, scale: 0.8, duration: 1 }, "-=0.8");

  // Section animations
  gsap.utils.toArray("section").forEach((section, index) => {
    if (index === 0) return; // Skip hero section

    gsap.from(section.querySelector(".section-header"), {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 50,
      duration: 1,
    });
  });

  // Skills animation
  gsap.utils.toArray(".skill-category").forEach((category, index) => {
    gsap.from(category, {
      scrollTrigger: {
        trigger: category,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      delay: index * 0.1,
    });
  });

  // Portfolio items animation
  gsap.utils.toArray(".portfolio-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      delay: index * 0.1,
    });
  });

  // Timeline animation
  gsap.utils.toArray(".timeline-item").forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      duration: 0.8,
    });
  });
}

// ========================================
// SKILL BARS ANIMATION
// ========================================
function initSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const percentage = bar.getAttribute("data-percent");

          setTimeout(() => {
            bar.style.width = percentage + "%";
          }, 200);

          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  skillBars.forEach((bar) => observer.observe(bar));
}

// ========================================
// PORTFOLIO FILTER
// ========================================
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      portfolioItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (filterValue === "all" || filterValue === itemCategory) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, 100);
        } else {
          item.style.opacity = "0";
          item.style.transform = "translateY(20px)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
  const form = document.getElementById("contact-form");
  const submitBtn = document.querySelector(".btn-submit");

  if (!form) return;

  // Floating labels
  const formGroups = document.querySelectorAll(".form-group");
  formGroups.forEach((group) => {
    const input = group.querySelector("input, textarea");
    const label = group.querySelector("label");

    if (input && label) {
      input.addEventListener("focus", () => {
        label.style.transform = "translateY(-25px) scale(0.8)";
        label.style.color = "var(--primary-color)";
      });

      input.addEventListener("blur", () => {
        if (!input.value) {
          label.style.transform = "translateY(0) scale(1)";
          label.style.color = "var(--gray-color)";
        }
      });
    }
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Show loading state
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.classList.add("success");
      submitBtn.querySelector(".btn-text").textContent = "Message Sent!";

      // Reset form
      setTimeout(() => {
        form.reset();
        submitBtn.classList.remove("success");
        submitBtn.querySelector(".btn-text").textContent = "Send Message";
        submitBtn.disabled = false;

        // Reset labels
        formGroups.forEach((group) => {
          const label = group.querySelector("label");
          if (label) {
            label.style.transform = "translateY(0) scale(1)";
            label.style.color = "var(--gray-color)";
          }
        });
      }, 3000);
    }, 2000);
  });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed header

        // Add smooth scroll with easing
        smoothScrollTo(offsetTop, 1000);
      }
    });
  });
}

function smoothScrollTo(target, duration) {
  const start = window.pageYOffset;
  const distance = target - start;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, start, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  requestAnimationFrame(animation);
}

// ========================================
// PARALLAX EFFECTS
// ========================================
function initParallaxEffects() {
  window.addEventListener(
    "scroll",
    throttle(() => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      // Parallax for floating shapes
      const shapes = document.querySelectorAll(".floating-shapes .shape");
      shapes.forEach((shape, index) => {
        const speed = 0.1 + index * 0.05;
        const rotation = scrolled * 0.1;
        shape.style.transform = `translateY(${
          scrolled * speed
        }px) rotate(${rotation}deg)`;
      });

      // Parallax for hero elements
      const heroVisual = document.querySelector(".hero-visual");
      if (heroVisual) {
        heroVisual.style.transform = `translateY(${rate}px)`;
      }

      // Add color shift based on scroll position
      const scrollProgress = Math.min(scrolled / window.innerHeight, 1);
      document.documentElement.style.setProperty(
        "--scroll-hue",
        `${scrollProgress * 30}`
      );
    }, 16)
  );
}

// ========================================
// TECH STACK ANIMATION
// ========================================
function initTechStackAnimation() {
  const techItems = document.querySelectorAll(".tech-item");

  techItems.forEach((item, index) => {
    // Add hover effects
    item.addEventListener("mouseenter", () => {
      item.style.transform = "scale(1.2)";
      item.style.background = "var(--gradient-primary)";
      item.style.color = "var(--white-color)";

      // Show tooltip
      const tooltip = document.createElement("div");
      tooltip.className = "tech-tooltip";
      tooltip.textContent = item.getAttribute("data-tech");
      tooltip.style.cssText = `
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--dark-color);
                color: var(--white-color);
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

      item.appendChild(tooltip);
      setTimeout(() => (tooltip.style.opacity = "1"), 10);
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "scale(1)";
      item.style.background = "var(--white-color)";
      item.style.color = "var(--primary-color)";

      const tooltip = item.querySelector(".tech-tooltip");
      if (tooltip) {
        tooltip.remove();
      }
    });

    // Floating animation
    item.style.animationDelay = `${index * 0.5}s`;
  });
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
function optimizePerformance() {
  // Lazy load images
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));

  // Debounce scroll events
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      // Trigger scroll-dependent functions here
    }, 10);
  });
}

// ========================================
// EASTER EGGS
// ========================================
function initEasterEggs() {
  let konamiCode = [];
  const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

  document.addEventListener("keydown", (e) => {
    konamiCode.push(e.keyCode);

    if (konamiCode.length > konamiSequence.length) {
      konamiCode.shift();
    }

    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
      // Easter egg triggered!
      document.body.style.filter = "hue-rotate(180deg)";
      setTimeout(() => {
        document.body.style.filter = "none";
      }, 3000);

      konamiCode = [];
    }
  });

  // Console message
  console.log(
    "%c🚀 Welcome to Sravani Bahurothu's Portfolio!",
    "color: #16a34a; font-size: 20px; font-weight: bold;"
  );
  console.log(
    "%cInterested in the code? Feel free to explore!",
    "color: #0ea5e9; font-size: 14px;"
  );
}

// ========================================
// THEME TOGGLE
// ========================================
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem("theme") || "light";
  body.setAttribute("data-theme", savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Add transition class for smooth animation
    body.classList.add("theme-transitioning");

    // Create ripple effect from button
    createThemeRipple(themeToggle);

    // Change theme after a short delay for smooth transition
    setTimeout(() => {
      body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // Update Three.js particle colors
      updateParticleColors(newTheme);
    }, 100);

    // Remove transition class after animation completes
    setTimeout(() => {
      body.classList.remove("theme-transitioning");
    }, 500);
  });
}

function createThemeRipple(button) {
  const ripple = document.createElement("div");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2 - size / 2}px;
        top: ${rect.top + rect.height / 2 - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(22, 163, 74, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-expand 0.6s ease-out;
        pointer-events: none;
        z-index: 9999;
    `;

  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function updateParticleColors(theme) {
  if (!particles) return;

  const colors = particles.geometry.attributes.color;
  const newColorPalette =
    theme === "dark"
      ? [
          new THREE.Color(0x10b981), // Emerald
          new THREE.Color(0x06b6d4), // Cyan
          new THREE.Color(0x8b5cf6), // Violet
          new THREE.Color(0xf59e0b), // Amber
          new THREE.Color(0xec4899), // Pink
        ]
      : [
          new THREE.Color(0x16a34a), // Green
          new THREE.Color(0x22c55e), // Light green
          new THREE.Color(0x0ea5e9), // Blue
          new THREE.Color(0x8b5cf6), // Purple
          new THREE.Color(0xf59e0b), // Amber
        ];

  for (let i = 0; i < colors.count; i++) {
    const color =
      newColorPalette[Math.floor(Math.random() * newColorPalette.length)];
    colors.setXYZ(i, color.r, color.g, color.b);
  }

  colors.needsUpdate = true;
}

// Add CSS for ripple animation
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
    @keyframes ripple-expand {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ========================================
// INITIALIZATION
// ========================================
function initializeAnimations() {
  initCustomCursor();
  initNavigation();
  initThreeJS();
  initTypingAnimation();
  initCounterAnimation();
  initGSAPAnimations();
  initSkillBars();
  initPortfolioFilter();
  initContactForm();
  initSmoothScroll();
  initParallaxEffects();
  initTechStackAnimation();
  initThemeToggle();
  optimizePerformance();
  initEasterEggs();
}

// Start initialization when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (isLoaded) {
    initializeAnimations();
  }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Throttle function for performance
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounce function for performance
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Random number generator
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Element in viewport check
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ========================================
// EXPORT FOR POTENTIAL MODULE USE
// ========================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeAnimations,
    initCustomCursor,
    initNavigation,
    initThreeJS,
    initTypingAnimation,
    initCounterAnimation,
    initGSAPAnimations,
    initSkillBars,
    initPortfolioFilter,
    initContactForm,
    initSmoothScroll,
    initParallaxEffects,
    initTechStackAnimation,
    optimizePerformance,
    initEasterEggs,
  };
}
