document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const body = document.body;
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = 'Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.textContent = 'Dark Mode';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeToggle.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        }
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: body.getAttribute('data-theme') }
        }));
    });
    
    // Watch for system theme changes
    prefersDarkScheme.addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', newTheme);
        
        // Dispatch custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme }
        }));
    });
    
    // Listen for theme changes to update 3D scene
    document.addEventListener('themeChanged', function(e) {
        updateSceneColors(e.detail.theme);
    });
    
    function updateSceneColors(theme) {
        // This function would be implemented in threejs.js
        // to update the 3D scene colors based on the theme
        console.log('Theme changed to:', theme);
    }
});