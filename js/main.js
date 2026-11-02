/* =========================================
   SCROLL ANIMATIONS & INTERACTIONS
   Enhanced version with bug fixes and improvements
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for Fade-Up Elements
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Performance: run once per element
            }
        });
    }, observerOptions);

    // Observe all fade-up elements
    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // Header Transparency on Scroll
    const header = document.querySelector('.site-header');
    if (header) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Initialize all features
    init3DTilt();              // FIX: Now properly called
    initShuffleGallery();
    startProfileCarousel();
});


/* =========================================
   PROFILE CAROUSEL
   ========================================= */
function startProfileCarousel() {
    const images = document.querySelectorAll('.profile-carousel img');
    if (images.length < 2) return;

    let currentIndex = 0;

    // Ensure first image is active on load
    images[currentIndex].classList.add('active');

    setInterval(() => {
        // Remove active from current
        images[currentIndex].classList.remove('active');

        // Move to next
        currentIndex = (currentIndex + 1) % images.length;

        // Add active to next
        images[currentIndex].classList.add('active');
    }, 4000); // Switch every 4 seconds
}


/* =========================================
   3D TILT EFFECT
   ========================================= */
function init3DTilt() {
    const cards = document.querySelectorAll('.tilt-card');

    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();

            // Calculate mouse position relative to center of card
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Sensitivity multiplier (lower = less movement)
            const multiplier = 15;

            const xRot = -(y / rect.height) * multiplier; // Rotate X based on Y position
            const yRot = (x / rect.width) * multiplier;   // Rotate Y based on X position

            card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
        });

        // Reset on mouse leave with smooth transition
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition = 'transform 0.5s ease-out';
        });

        // Remove transition on enter for instant response
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}


/* =========================================
   PHOTOGRAPHY SHUFFLE GALLERY
   Smart image rotation with collision avoidance
   ========================================= */
function initShuffleGallery() {
    const photoContainers = document.querySelectorAll('.photo-shuffle-card .photo-container');

    photoContainers.forEach((container) => {
        const images = container.querySelectorAll('img');
        if (images.length < 2) return;

        let currentIndex = 0;

        // Find the index of the currently active image (if any)
        images.forEach((img, idx) => {
            if (img.classList.contains('active')) {
                currentIndex = idx;
            }
        });

        // If no image is active, activate the first one
        if (!container.querySelector('img.active')) {
            images[0].classList.add('active');
            currentIndex = 0;
        }

        // Randomize start time for organic, staggered effect
        const baseDelay = 3500;
        const randomVariation = Math.random() * 2500;
        const delay = baseDelay + randomVariation;

        setInterval(() => {
            // STEP 1: Identify images currently showing in other cards
            const forbiddenSrcs = [];
            photoContainers.forEach(otherContainer => {
                if (otherContainer !== container) {
                    const activeImg = otherContainer.querySelector('img.active');
                    if (activeImg) {
                        forbiddenSrcs.push(activeImg.src);
                    }
                }
            });

            // STEP 2: Find next suitable image (avoid collisions)
            let nextIndex = currentIndex;
            let attempts = 0;
            let foundSafe = false;
            const maxAttempts = images.length;

            while (attempts < maxAttempts && !foundSafe) {
                nextIndex = (nextIndex + 1) % images.length;

                // Skip if it's the same as current (when possible)
                if (nextIndex === currentIndex && images.length > 1) {
                    attempts++;
                    continue;
                }

                const candidateSrc = images[nextIndex].src;

                // Check for collision with other active images
                if (!forbiddenSrcs.includes(candidateSrc)) {
                    foundSafe = true;
                } else {
                    attempts++;
                }
            }

            // Fallback: if all images are taken (unlikely), just proceed to next
            if (!foundSafe) {
                nextIndex = (currentIndex + 1) % images.length;
            }

            // STEP 3: Execute the swap
            images[currentIndex].classList.remove('active');
            currentIndex = nextIndex;
            images[currentIndex].classList.add('active');

        }, delay);
    });
}


/* =========================================
   UTILITY: Debounce Function
   (Optional - for future enhancements)
   ========================================= */
function debounce(func, wait) {
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
