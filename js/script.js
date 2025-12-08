document.addEventListener('DOMContentLoaded', function () {
    // Mobile Drawer Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerOverlay = document.querySelector('.drawer-overlay');

    function openDrawer() {
        mobileDrawer.classList.add('open');
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openDrawer);
    }

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Animations on Load
    // Add 'visible' class to all fade-in-up elements after a short delay
    // The staggering is handled by CSS transition-delay classes (delay-1, delay-2, etc.)
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const recaptchaResponse = grecaptcha.getResponse();

            if (!name || !email || !message) {
                alert("Please fill out all fields!");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address!");
                return;
            }

            if (!recaptchaResponse) {
                alert("Please verify that you are not a robot.");
                return;
            }

            const data = {
                data: {
                    name: name,
                    email: email,
                    message: message,
                },
                recaptcha_response: recaptchaResponse,
            };

            try {
                const submitBtn = contactForm.querySelector('.submit-btn');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                const response = await fetch("https://api.ebspartners.com.au/send-email/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    document.getElementById('confirmation-message').style.display = 'block';
                    contactForm.reset();
                    grecaptcha.reset();

                    // Scroll to confirmation
                    document.getElementById('confirmation-message').scrollIntoView({ behavior: 'smooth' });

                    // Reload/Redirect after 2 seconds (optional, matching React behavior)
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    alert(`Failed to send your message: ${errorData.detail || "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while sending your message.");
            } finally {
                const submitBtn = contactForm.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.textContent = 'Submit'; // Reset text (though we reload on success)
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Slider Logic (for whyus-2.html)
    const track = document.querySelector('.slider-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const dotsNav = document.querySelector('.slider-nav');
        const dots = Array.from(dotsNav.children);

        // Calculate width based on the first slide
        let slideWidth = slides[0].getBoundingClientRect().width;

        // Arrange the slides next to one another
        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        const moveToSlide = (track, currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        };

        // Infinite Loop Logic
        // When I click left, move slides to the left
        if (prevButton) {
            prevButton.addEventListener('click', e => {
                const currentSlide = track.querySelector('.current-slide');
                let prevSlide = currentSlide.previousElementSibling;
                const currentDot = dotsNav.querySelector('.current-slide');
                let prevDot = currentDot.previousElementSibling;

                // Loop to last slide if at start
                if (!prevSlide) {
                    prevSlide = slides[slides.length - 1];
                    prevDot = dots[dots.length - 1];
                }

                moveToSlide(track, currentSlide, prevSlide);
                updateDots(currentDot, prevDot);
            });
        }

        // When I click right, move slides to the right
        if (nextButton) {
            nextButton.addEventListener('click', e => {
                const currentSlide = track.querySelector('.current-slide');
                let nextSlide = currentSlide.nextElementSibling;
                const currentDot = dotsNav.querySelector('.current-slide');
                let nextDot = currentDot.nextElementSibling;

                // Loop to first slide if at end
                if (!nextSlide) {
                    nextSlide = slides[0];
                    nextDot = dots[0];
                }

                moveToSlide(track, currentSlide, nextSlide);
                updateDots(currentDot, nextDot);
            });
        }

        // When I click the nav indicators, move to that slide
        if (dotsNav) {
            dotsNav.addEventListener('click', e => {
                const targetDot = e.target.closest('button');

                if (!targetDot) return;

                const currentSlide = track.querySelector('.current-slide');
                const currentDot = dotsNav.querySelector('.current-slide');
                const targetIndex = dots.findIndex(dot => dot === targetDot);
                const targetSlide = slides[targetIndex];

                moveToSlide(track, currentSlide, targetSlide);
                updateDots(currentDot, targetDot);
            });
        }

        // Handle resize to reset positions
        window.addEventListener('resize', () => {
            slideWidth = slides[0].getBoundingClientRect().width;
            slides.forEach((slide, index) => {
                slide.style.left = slideWidth * index + 'px';
            });
            // Re-center current slide
            const currentSlide = track.querySelector('.current-slide');
            track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
        });
    }
});
