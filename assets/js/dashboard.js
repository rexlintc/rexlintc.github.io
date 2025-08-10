// Dashboard JavaScript - Navigation and Stats
(function() {
    'use strict';

    // Router class for hash-based navigation
    class Router {
        constructor() {
            this.routes = {
                'dashboard': 'dashboard-page',
                'resume': 'resume-page',
                'portfolio': 'portfolio-page',
                'blog': 'blog-page',
                'contact': 'contact-page'
            };
            
            this.init();
        }

        init() {
            // Handle initial page load
            this.handleRoute();
            
            // Listen for hash changes
            window.addEventListener('hashchange', () => this.handleRoute());
            
            // Add click listeners to nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = e.currentTarget.getAttribute('data-page');
                    this.navigateTo(page);
                });
            });
        }

        handleRoute() {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            this.showPage(hash);
            this.updateActiveNav(hash);
        }

        navigateTo(page) {
            window.location.hash = page;
        }

        showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show target page
            const targetPageId = this.routes[pageId] || this.routes['dashboard'];
            const targetPage = document.getElementById(targetPageId);
            
            if (targetPage) {
                targetPage.classList.add('active');
                
                // Load page-specific content if needed
                this.loadPageContent(pageId);
            }
        }

        updateActiveNav(activePageId) {
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to current page nav link
            const activeLink = document.querySelector(`[data-page="${activePageId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }

        loadPageContent(pageId) {
            switch(pageId) {
                case 'dashboard':
                    this.loadDashboardStats();
                    break;
                case 'portfolio':
                    this.enhancePortfolio();
                    break;
            }
        }

        loadDashboardStats() {
            // Load GitHub stats
            this.loadGitHubStats();
            
            // Animate stat cards
            this.animateStatCards();
        }

        async loadGitHubStats() {
            try {
                // GitHub API call to get user info and recent activity
                const userResponse = await fetch('https://api.github.com/users/rexlintc');
                const userData = await userResponse.json();
                
                if (userData.public_repos) {
                    document.getElementById('total-projects').textContent = userData.public_repos;
                }

                // Get commit activity for the current year
                const eventsResponse = await fetch('https://api.github.com/users/rexlintc/events/public');
                const events = await eventsResponse.json();
                
                if (Array.isArray(events)) {
                    const currentYear = new Date().getFullYear();
                    const thisYearEvents = events.filter(event => {
                        const eventYear = new Date(event.created_at).getFullYear();
                        return eventYear === currentYear && event.type === 'PushEvent';
                    });
                    
                    // Count commits from push events
                    let commitCount = 0;
                    thisYearEvents.forEach(event => {
                        if (event.payload && event.payload.commits) {
                            commitCount += event.payload.commits.length;
                        }
                    });
                    
                    document.getElementById('github-commits').textContent = commitCount > 0 ? commitCount : '50+';
                } else {
                    document.getElementById('github-commits').textContent = '50+';
                }

            } catch (error) {
                console.log('GitHub API rate limited or unavailable, using fallback data');
                document.getElementById('github-commits').textContent = '50+';
                document.getElementById('total-projects').textContent = '4';
            }
        }

        animateStatCards() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            entry.target.style.transition = 'all 0.6s ease';
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);
                        
                        observer.unobserve(entry.target);
                    }
                });
            });

            document.querySelectorAll('.stat-card').forEach((card, index) => {
                setTimeout(() => {
                    observer.observe(card);
                }, index * 100);
            });
        }

        enhancePortfolio() {
            // Add hover effects and lazy loading for portfolio images
            const portfolioImages = document.querySelectorAll('.project-image img');
            
            portfolioImages.forEach(img => {
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
            });
        }
    }

    // Stats Counter Animation
    class StatsCounter {
        constructor() {
            this.counters = document.querySelectorAll('.stat-content h3');
            this.animateCounters();
        }

        animateCounters() {
            this.counters.forEach(counter => {
                const target = parseInt(counter.textContent.replace(/\D/g, '')) || 0;
                if (target > 0) {
                    this.animateValue(counter, 0, target, 2000);
                }
            });
        }

        animateValue(element, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const current = Math.floor(progress * (end - start) + start);
                
                const suffix = element.textContent.replace(/\d/g, '');
                element.textContent = current + suffix;
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }

    // Theme Manager (for future theme switching)
    class ThemeManager {
        constructor() {
            this.currentTheme = 'default';
            this.themes = {
                'default': {
                    '--primary-color': '#2c3e50',
                    '--accent-color': '#3498db'
                },
                'dark': {
                    '--primary-color': '#1a1a1a',
                    '--accent-color': '#4a90e2'
                }
            };
        }

        applyTheme(themeName) {
            const theme = this.themes[themeName];
            if (theme) {
                const root = document.documentElement;
                Object.keys(theme).forEach(property => {
                    root.style.setProperty(property, theme[property]);
                });
                this.currentTheme = themeName;
            }
        }
    }

    // Utility functions
    const utils = {
        // Smooth scroll to element
        scrollTo: (element) => {
            element.scrollIntoView({ behavior: 'smooth' });
        },

        // Format date for display
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        // Debounce function for performance
        debounce: (func, wait) => {
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
    };

    // Performance optimization
    const performanceOptimizations = {
        // Lazy load images
        initLazyLoading: () => {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        // Preload critical resources
        preloadResources: () => {
            const criticalImages = [
                '/images/avatar.jpg'
            ];

            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize main components
        const router = new Router();
        const themeManager = new ThemeManager();
        
        // Initialize performance optimizations
        performanceOptimizations.initLazyLoading();
        performanceOptimizations.preloadResources();

        // Initialize stats counter after a brief delay to allow for page animation
        setTimeout(() => {
            new StatsCounter();
        }, 500);

        // Add loading class removal after page load
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });

        // Make utilities globally available for debugging
        window.dashboardUtils = utils;
        window.themeManager = themeManager;

        console.log('Dashboard initialized successfully');
    });

    // Handle errors gracefully
    window.addEventListener('error', (event) => {
        console.error('Dashboard error:', event.error);
        // Could send error reports to analytics service here
    });

    // Service Worker registration for PWA capabilities (future enhancement)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // navigator.serviceWorker.register('/sw.js')
            //   .then(registration => console.log('SW registered'))
            //   .catch(error => console.log('SW registration failed'));
        });
    }

})();