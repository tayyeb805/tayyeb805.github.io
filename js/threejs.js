// 3D Background Scene with Three.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        return;
    }
    
    // Scene setup
    const canvas = document.getElementById('3d-bg');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Color schemes for light and dark themes
    const colors = {
        light: {
            primary: 0x4361ee,    // Blue
            secondary: 0x3f37c9,  // Darker Blue
            accent: 0xf72585,     // Pink
            background: 0xf8f9fa  // Light background
        },
        dark: {
            primary: 0x7209b7,    // Purple
            secondary: 0x560bad,  // Darker Purple
            accent: 0xf72585,     // Pink
            background: 0x212529  // Dark background
        }
    };
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500; // Increased particle count for richer effect
    
    const posArray = new Float32Array(particleCount * 3);
    const sizeArray = new Float32Array(particleCount);
    const colorArray = new Float32Array(particleCount * 3);
    
    // Create particles with initial colors
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
        if (i % 3 === 0) {
            sizeArray[i / 3] = Math.random() * 0.5 + 0.1;
            
            // Create a base color based on theme
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const themeColors = colors[currentTheme];
            const baseColor = new THREE.Color(
                Math.random() > 0.5 ? themeColors.primary : themeColors.secondary
            );
            
            // Mix with a random color for variation
            const randomColor = new THREE.Color(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            
            const finalColor = baseColor.lerp(randomColor, 0.3);
            
            colorArray[i] = finalColor.r;
            colorArray[i + 1] = finalColor.g;
            colorArray[i + 2] = finalColor.b;
        }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15, // Slightly larger particles
        vertexColors: true,
        transparent: true,
        opacity: 0.9, // More visible particles
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Camera position
    camera.position.z = 5;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // More dynamic rotation
        particlesMesh.rotation.x += 0.0003;
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.z += 0.0002;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Update scene colors when theme changes
    function updateSceneColors(theme) {
        const themeColors = colors[theme];
        
        // Update background color
        renderer.setClearColor(new THREE.Color(themeColors.background), 0);
        
        // Update particle colors
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Create a base color based on theme
            const baseColor = new THREE.Color(
                Math.random() > 0.5 ? themeColors.primary : themeColors.secondary
            );
            
            // Mix with accent color for some particles
            if (Math.random() > 0.8) {
                baseColor.lerp(new THREE.Color(themeColors.accent), 0.7);
            }
            
            // Add some variation
            const randomColor = new THREE.Color(
                Math.random() * 0.3 + 0.7,
                Math.random() * 0.3 + 0.7,
                Math.random() * 0.3 + 0.7
            );
            
            const finalColor = baseColor.lerp(randomColor, 0.2);
            
            colorArray[i] = finalColor.r;
            colorArray[i + 1] = finalColor.g;
            colorArray[i + 2] = finalColor.b;
        }
        
        particlesGeometry.attributes.color.needsUpdate = true;
    }
    
    // Initialize with current theme
    updateSceneColors(document.body.getAttribute('data-theme') || 'light');
});