// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDetpFm7TbKddqNjpN6dojuiY7bHh1ErOI",
  authDomain: "portfolio-3f340.firebaseapp.com",
  projectId: "portfolio-3f340",
  storageBucket: "portfolio-3f340.appspot.com",
  messagingSenderId: "698736281780",
  appId: "1:698736281780:web:09b0937708430b160e2fe1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            window.location.href = "?admin";
        }
    });

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    document.getElementById('year').textContent = new Date().getFullYear();

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    function initTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach(el => {
            const words = JSON.parse(el.getAttribute('data-words') || '["M. Tayyab", "a Developer", "a Designer"]');
            let wordIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            let typeSpeed = 150;
            
            function type() {
                const currentWord = words[wordIndex];
                
                if (isDeleting) {
                    el.textContent = currentWord.substring(0, charIndex - 1);
                    charIndex--;
                    typeSpeed = 100;
                } else {
                    el.textContent = currentWord.substring(0, charIndex + 1);
                    charIndex++;
                    typeSpeed = 150;
                }
                
                if (!isDeleting && charIndex === currentWord.length) {
                    isDeleting = true;
                    typeSpeed = 1500;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    typeSpeed = 500;
                }
                
                setTimeout(type, typeSpeed);
            }
            
            setTimeout(type, 1000);
        });
    }

    document.querySelectorAll('.tech-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.addEventListener('click', () => {
            item.classList.add('clicked');
            setTimeout(() => {
                item.classList.remove('clicked');
            }, 300);
        });
    });

    function updateHeroSection(data) {
        const heroName = document.querySelector('.hero-content h1 span.typing-text');
        if (heroName) {
            heroName.setAttribute('data-words', 
                JSON.stringify(data.typingWords || ["M. Tayyab", "a Developer", "a Designer"])
            );
            initTypingEffect();
        }
        
        const profession = document.querySelector('.hero-content h2.profession');
        if (profession && data.profession) {
            profession.textContent = data.profession;
        }
        
        const description = document.querySelector('.hero-content p.hero-description');
        if (description && data.description) {
            description.textContent = data.description;
        }

        if (data.imageUrl) {
            const profileImg = document.querySelector('.profile-img');
            if (profileImg) {
                profileImg.src = data.imageUrl;
            }
        }
    }

    function updateAboutSection(data) {
        const aboutText = document.querySelector('.about-text p');
        if (aboutText && data.bio) {
            aboutText.textContent = data.bio;
        }
        
        const infoCards = {
            'Name:': data.name,
            'Email:': data.email,
            'Experience:': data.experience,
            'Location:': data.location
        };
        
        document.querySelectorAll('.info-card').forEach(card => {
            const key = card.querySelector('span').textContent;
            if (infoCards[key]) {
                card.querySelector('p').textContent = infoCards[key];
            }
        });
    }

    function updateContactSection(data) {
        const contactCards = {
            'Email': data.email,
            'Phone': data.phone,
            'Location': data.location
        };
        
        document.querySelectorAll('.contact-card').forEach(card => {
            const title = card.querySelector('h3').textContent;
            if (contactCards[title]) {
                card.querySelector('p').textContent = contactCards[title];
            }
        });
    }

    function renderProjects(projects) {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-image">
                    <img src="${project.imageUrl || project.image}" alt="${project.title}">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.liveUrl}" class="btn btn-outline" target="_blank" rel="noopener">Live Demo</a>
                        <a href="${project.codeUrl}" class="btn btn-primary" target="_blank" rel="noopener">View Code</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderSkills(skillsByCategory) {
        const skillsContainer = document.querySelector('.skills-container');
        if (!skillsContainer) return;
        
        skillsContainer.innerHTML = Object.entries(skillsByCategory).map(([category, skills]) => `
            <div class="skill-category glass-container">
                <h3><i class="${getCategoryIcon(category)}"></i> ${category}</h3>
                <ul class="skill-list">
                    ${skills.map(skill => `
                        <li class="skill-item">
                            <div class="skill-name">
                                <span>${skill.name}</span>
                                <span>${skill.level}%</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-progress" style="width: ${skill.level}%"></div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    function getCategoryIcon(category) {
        const icons = {
            'Frontend': 'fas fa-code',
            'Backend': 'fas fa-server',
            'Tools': 'fas fa-tools',
            'Design': 'fas fa-paint-brush'
        };
        return icons[category] || 'fas fa-star';
    }

    function setupRealTimeListeners() {
        // Hero section
        db.collection('content').doc('hero')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    updateHeroSection(data);
                }
            });

        // About section
        db.collection('content').doc('about')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    updateAboutSection(data);
                }
            });

        // Contact section
        db.collection('content').doc('contact')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    updateContactSection(data);
                }
            });

        // Projects
        db.collection('projects')
            .orderBy('createdAt', 'desc')
            .onSnapshot((querySnapshot) => {
                const projects = [];
                querySnapshot.forEach(doc => {
                    projects.push(doc.data());
                });
                renderProjects(projects);
            });

        // Skills
        db.collection('skills')
            .onSnapshot((querySnapshot) => {
                const skillsByCategory = {};
                querySnapshot.forEach(doc => {
                    const skill = doc.data();
                    if (!skillsByCategory[skill.category]) {
                        skillsByCategory[skill.category] = [];
                    }
                    skillsByCategory[skill.category].push(skill);
                });
                renderSkills(skillsByCategory);
            });
    }

    function initAnimations() {
        if (typeof gsap === 'undefined') return;
        
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.reveal-up').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        const tl = gsap.timeline();
        tl.from('.hero-content h1', { y: 50, opacity: 0, duration: 1 })
            .from('.hero-content h2', { y: 50, opacity: 0, duration: 0.8 }, "-=0.5")
            .from('.hero-content p', { y: 50, opacity: 0, duration: 0.8 }, "-=0.5")
            .from('.hero-cta', { y: 50, opacity: 0, duration: 0.8 }, "-=0.5")
            .from('.floating-avatar', { 
                scale: 0.8, 
                opacity: 0, 
                duration: 1.5, 
                ease: "elastic.out(1, 0.5)" 
            }, "-=0.5")
            .from('.tech-item', { 
                scale: 0, 
                opacity: 0, 
                duration: 0.5, 
                stagger: 0.2,
                ease: "back.out(1.7)" 
            }, "-=0.5");

        gsap.to('.tech-item:nth-child(1)', {
            y: 10,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('.tech-item:nth-child(2)', {
            y: -15,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.5
        });

        gsap.to('.tech-item:nth-child(3)', {
            y: 15,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.8
        });
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            console.log('Form submitted:', data);
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }

    async function initializeAll() {
        setupRealTimeListeners();
        initTypingEffect();
        initAnimations();
    }

    initializeAll().catch(error => {
        console.error("Initialization error:", error);
    });
});

// Add this to your existing main.js
document.querySelectorAll('.cv-download-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Optional: Add download tracking or animation
    btn.classList.add('downloading');
    setTimeout(() => {
      btn.classList.remove('downloading');
    }, 1000);
  });
});