/**
 * SRL Lab Mohali — Premium Animation Engine v2.0
 * Features: Slider, Nav, Header, Scroll Reveal, Counters, FAQ,
 *           Form, Click Ripples, Tilt Cards, Magnetic Buttons,
 *           Scroll Progress, Particle Canvas, Page Transitions,
 *           Floating Orbs, Typewriter, Stagger Reveals
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       0. INJECT GLOBAL UI ELEMENTS
       ========================================================= */
    // Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.prepend(progressBar);

    // Page transition overlay – simple opacity fade only
    const overlay = document.createElement('div');
    overlay.id = 'page-transition';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:linear-gradient(135deg,#0075BB,#004a80);
        opacity:1; pointer-events:none;
        transition:opacity 0.5s ease;
    `;
    document.body.prepend(overlay);

    // Immediately fade out on every page load (fixes stuck blue screen)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 550);
        });
    });


    /* =========================================================
       1. HERO SLIDER
       ========================================================= */
    const track     = document.getElementById('sliderTrack');
    const slides    = document.querySelectorAll('.slide');
    const prevBtn   = document.getElementById('sliderPrev');
    const nextBtn   = document.getElementById('sliderNext');
    const dots      = document.querySelectorAll('.dot');
    let current     = 0;
    let autoTimer   = null;
    let isAnimating = false;

    function goToSlide(index) {
        if (isAnimating || !track) return;
        isAnimating = true;
        slides[current].classList.remove('active');
        dots[current]?.classList.remove('active');
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        slides[current].classList.add('active');
        dots[current]?.classList.add('active');
        // Re-trigger text animations
        slides[current].querySelectorAll('.slide-badge,.slide-title,.slide-desc,.slide-ctas').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = '';
        });
        setTimeout(() => { isAnimating = false; }, 750);
    }
    function startAutoSlide() { autoTimer = setInterval(() => goToSlide(current + 1), 5500); }
    function resetAutoSlide() { clearInterval(autoTimer); startAutoSlide(); }

    if (track && slides.length > 0) {
        slides[0].classList.add('active');
        prevBtn?.addEventListener('click', () => { goToSlide(current - 1); resetAutoSlide(); });
        nextBtn?.addEventListener('click', () => { goToSlide(current + 1); resetAutoSlide(); });
        dots.forEach(dot => dot.addEventListener('click', () => { goToSlide(+dot.dataset.index); resetAutoSlide(); }));
        let tx = 0;
        track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive:true });
        track.addEventListener('touchend', e => {
            const d = tx - e.changedTouches[0].clientX;
            if (Math.abs(d) > 50) { d > 0 ? goToSlide(current+1) : goToSlide(current-1); resetAutoSlide(); }
        });
        track.addEventListener('mouseenter', () => clearInterval(autoTimer));
        track.addEventListener('mouseleave', startAutoSlide);
        startAutoSlide();
    }


    /* =========================================================
       2. SCROLL PROGRESS BAR
       ========================================================= */
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total    = document.body.scrollHeight - window.innerHeight;
        progressBar.style.width = `${(scrolled / total) * 100}%`;
    }, { passive:true });


    /* =========================================================
       3. STICKY HEADER
       ========================================================= */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive:true });


    /* =========================================================
       4. MOBILE NAVIGATION
       ========================================================= */
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navList   = document.getElementById('navList');
    mobileBtn?.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        mobileBtn.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navList?.classList.remove('open');
            if (mobileBtn) mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            document.body.style.overflow = '';
        });
    });


    /* =========================================================
       5. PAGE TRANSITIONS (cross-page links)
       ========================================================= */
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        // Only internal .html links, not anchors, tel, wa, external
        if (!href || href.startsWith('#') || href.startsWith('tel:') ||
            href.startsWith('https://') || href.startsWith('http://') ||
            href.startsWith('mailto:') || !href.endsWith('.html')) return;

        link.addEventListener('click', e => {
            e.preventDefault();
            overlay.classList.add('entering');
            setTimeout(() => {
                window.location.href = href;
            }, 480);
        });
    });

    // Fade out overlay on page load
    window.addEventListener('load', () => {
        overlay.style.transform = 'translateY(0)';
        overlay.style.transition = 'none';
        setTimeout(() => {
            overlay.style.transition = 'transform 0.55s cubic-bezier(0.77,0,0.18,1)';
            overlay.classList.remove('entering');
            overlay.classList.add('leaving');
            setTimeout(() => overlay.classList.remove('leaving'), 600);
        }, 50);
    });


    /* =========================================================
       6. SCROLL REVEAL + STAGGER OBSERVER
       ========================================================= */
    const allRevealEls = document.querySelectorAll(
        '.reveal-up,.reveal-left,.reveal-right,.reveal-zoom,.reveal-flip,.service-card,.review-card,.why-card,.fact-item'
    );
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold:0.1, rootMargin:'0px 0px -40px 0px' });
    allRevealEls.forEach(el => {
        // Auto-add reveal class if missing
        if (!el.classList.contains('reveal-up') && !el.classList.contains('reveal-left') &&
            !el.classList.contains('reveal-right') && !el.classList.contains('reveal-zoom')) {
            el.classList.add('reveal-zoom');
        }
        revealObs.observe(el);
    });


    /* =========================================================
       7. COUNTER ANIMATION
       ========================================================= */
    function animateCounter(el, target, duration=1800) {
        const numEl = el.querySelector('.stat-num');
        if (!numEl) return;
        let start=0, step=target/(duration/16);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { numEl.textContent = target; clearInterval(t); }
            else numEl.textContent = Math.floor(start);
        }, 16);
    }
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                if (target) animateCounter(entry.target, target);
                counterObs.unobserve(entry.target);
            }
        });
    }, { threshold:0.5 });
    document.querySelectorAll('.stat-item[data-count]').forEach(el => counterObs.observe(el));


    /* =========================================================
       8. FAQ ACCORDION
       ========================================================= */
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-q').forEach(o => {
                o.setAttribute('aria-expanded','false');
                o.nextElementSibling?.classList.remove('open');
            });
            btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            btn.nextElementSibling?.classList.toggle('open', !isOpen);
        });
    });


    /* =========================================================
       9. CONTACT FORM → WHATSAPP
       ========================================================= */
    window.handleFormSubmit = function(e) {
        e.preventDefault();
        const name  = document.getElementById('cName')?.value?.trim();
        const phone = document.getElementById('cPhone')?.value?.trim();
        const test  = document.getElementById('cTest')?.value;
        const area  = document.getElementById('cAddress')?.value?.trim();
        const msg   = document.getElementById('cMsg')?.value?.trim();
        if (!name || !phone) return;
        const wa = encodeURIComponent(
            `Hello SRL Lab Mohali,\n\n` +
            `Name: ${name}\nPhone: ${phone}\nArea: ${area||'Not specified'}\nTest Required: ${test||'To discuss'}\nMessage: ${msg||'-'}\n\n` +
            `Please confirm my booking for home blood sample collection. Thank you!`
        );
        const form = document.getElementById('contactForm');
        const success = document.getElementById('formSuccess');
        if (form && success) { form.style.display='none'; success.style.display='block'; }
        setTimeout(() => window.open(`https://wa.me/918264423443?text=${wa}`, '_blank'), 800);
    };


    /* =========================================================
       10. BUTTON CLICK RIPPLE WAVE
       ========================================================= */
    document.querySelectorAll('.btn, .wa-book-btn, .wa-mini-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const wave = document.createElement('span');
            wave.className = 'wave';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            wave.style.cssText = `
                width:${size}px; height:${size}px;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
            `;
            this.appendChild(wave);
            setTimeout(() => wave.remove(), 700);
        });
    });


    /* =========================================================
       11. CURSOR RIPPLE on CLICK
       ========================================================= */
    document.addEventListener('click', e => {
        const r = document.createElement('div');
        r.className = 'ripple-circle';
        r.style.left = e.clientX + 'px';
        r.style.top  = e.clientY + 'px';
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 800);
    });


    /* =========================================================
       12. 3D TILT EFFECT on service/review/pkg cards
       ========================================================= */
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        document.querySelectorAll('.service-card,.review-card,.pkg-card,.why-card,.contact-form-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width  - 0.5;
                const y = (e.clientY - rect.top)  / rect.height - 0.5;
                card.style.transform = `
                    perspective(700px)
                    rotateY(${x * 10}deg)
                    rotateX(${-y * 10}deg)
                    translateY(-8px)
                    scale(1.02)
                `;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }


    /* =========================================================
       13. MAGNETIC BUTTONS
       ========================================================= */
    if (!isMobile) {
        document.querySelectorAll('.btn-primary,.btn-success,.pulse-btn,.wa-book-btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width/2)  * 0.35;
                const y = (e.clientY - rect.top  - rect.height/2) * 0.35;
                btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }


    /* =========================================================
       14. FLOATING PARTICLE CANVAS
       ========================================================= */
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive:true });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x  = Math.random() * canvas.width;
            this.y  = Math.random() * canvas.height;
            this.r  = Math.random() * 2.5 + 0.5;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.alpha = Math.random() * 0.35 + 0.05;
            const colors = ['0,117,187','66,175,85','255,203,5','237,28,36'];
            this.color = colors[Math.floor(Math.random()*colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    // Create 60 particles
    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i+1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0,117,187,${0.07 * (1 - dist/120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    /* =========================================================
       15. FLOATING BUTTONS – show on scroll
       ========================================================= */
    const floatingBtns = document.getElementById('floatingButtons');
    if (floatingBtns) {
        floatingBtns.style.opacity = '0';
        floatingBtns.style.transform = 'translateY(30px)';
        floatingBtns.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatingBtns.style.opacity = '1';
                floatingBtns.style.transform = 'translateY(0)';
            } else {
                floatingBtns.style.opacity = '0';
                floatingBtns.style.transform = 'translateY(30px)';
            }
        }, { passive:true });
    }


    /* =========================================================
       16. TYPEWRITER EFFECT on H1 headings
       ========================================================= */
    function typewrite(el, text, i=0) {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            setTimeout(() => typewrite(el, text, i+1), 38);
        }
    }
    // Apply to hero slide title on homepage only
    const heroTitle = document.querySelector('.slide-title.typewriter');
    if (heroTitle) {
        const orig = heroTitle.textContent;
        typewrite(heroTitle, orig);
    }


    /* =========================================================
       17. FLOATING ORBS INJECTION in hero/CTA sections
       ========================================================= */
    document.querySelectorAll('.page-hero, .search-wrap, [style*="linear-gradient(135deg,#0075BB"]').forEach(section => {
        if (section.querySelector('.floating-orbs')) return;
        const orbWrap = document.createElement('div');
        orbWrap.className = 'floating-orbs';
        const sizes = [180, 120, 220, 90, 150];
        sizes.forEach((s, i) => {
            const orb = document.createElement('div');
            orb.className = 'orb';
            orb.style.cssText = `
                width:${s}px; height:${s}px;
                top:${[10,60,30,75,45][i]}%;
                left:${[80,15,65,40,90][i]}%;
                animation-duration:${[6,8,10,7,9][i]}s;
                animation-delay:${[0,1.5,3,0.8,2.2][i]}s;
            `;
            orbWrap.appendChild(orb);
        });
        section.style.position = 'relative';
        section.prepend(orbWrap);
    });


    /* =========================================================
       18. SECTION ENTRANCE GLOW on scroll
       ========================================================= */
    const sectionObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'bodyFadeIn 0.6s ease';
                sectionObs.unobserve(entry.target);
            }
        });
    }, { threshold:0.05 });
    document.querySelectorAll('.py-section').forEach(s => sectionObs.observe(s));


    /* =========================================================
       19. SMOOTH SCROLL for internal anchors
       ========================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = (header?.offsetHeight || 104) + 10;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior:'smooth' });
        });
    });


    /* =========================================================
       20. SCROLL-TRIGGERED NUMBER GLOW INTENSIFY
       ========================================================= */
    window.addEventListener('scroll', () => {
        const scrollRatio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        document.querySelectorAll('.stat-num').forEach(el => {
            const glow = Math.min(scrollRatio * 3, 1);
            el.style.textShadow = `0 0 ${8 + glow*20}px rgba(255,203,5,${0.3 + glow*0.7})`;
        });
    }, { passive:true });


    /* =========================================================
       21. IMAGE PARALLAX on scroll
       ========================================================= */
    if (!isMobile) {
        const parallaxImages = document.querySelectorAll('.about-img, .hc-img, .why-img');
        window.addEventListener('scroll', () => {
            parallaxImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                const center = rect.top + rect.height/2 - window.innerHeight/2;
                img.style.transform = `translateY(${center * 0.07}px)`;
            });
        }, { passive:true });
    }


    /* =========================================================
       22. SECTION TAG SHIMMER on enter
       ========================================================= */
    const tagObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'shimmerMove 2s linear';
                tagObs.unobserve(entry.target);
            }
        });
    }, { threshold:0.8 });
    document.querySelectorAll('.section-tag').forEach(el => tagObs.observe(el));


    /* =========================================================
       23. FOOTER LINK STAGGER
       ========================================================= */
    const footerObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('li').forEach((li, i) => {
                    li.style.animation = `fadeInUp 0.4s ease ${i * 0.06}s both`;
                });
                footerObs.unobserve(entry.target);
            }
        });
    }, { threshold:0.2 });
    document.querySelectorAll('.footer-links ul, .footer-services ul, .footer-contact-info ul').forEach(ul => footerObs.observe(ul));


}); // end DOMContentLoaded
