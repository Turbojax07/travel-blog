 // Fish characters
        const fishCharacters = ['🐠', '🐟', '🐡', '🐬', '🐙', '🦀', '🦐', '🐳','🪼','🦑','🌴'];
        const fishes = [];
        const mouse = { x: -100, y: -100 };
        
        // Physics parameters
        const params = {
            mouseRepelRadius: 100,
            mouseRepelStrength: 30,
            fishRepelRadius: 40,
            fishRepelStrength: 15,
            maxSpeed: 5,
            wiggleIntensity: 0.5,
            wiggleSpeed: 0.03
        };
        
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        // Create fish elements
        function createFish() {
            const fish = document.createElement('div');
            fish.className = 'fish';
            
            // Random fish character
            const randomFish = fishCharacters[Math.floor(Math.random() * fishCharacters.length)];
            fish.textContent = randomFish;
            
            // Initial random position (some above viewport)
            const startX = Math.random() * window.innerWidth;
            const startY = -50 - Math.random() * 100;
            
            // Apply styles
            fish.style.left = startX + 'px';
            fish.style.top = startY + 'px';
            
            // Random size
            const size = 20 + Math.random() * 30; // 20-50px
            fish.style.fontSize = size + 'px';
            const fishSize = size * 0.6; // Approximate collision size
            
            // Random color for some fish
            if (Math.random() > 0.7) {
                const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
                fish.style.color = colors[Math.floor(Math.random() * colors.length)];
            }
            
            document.body.appendChild(fish);
            
            // Fish physics properties
            const fishObj = {
                element: fish,
                x: startX,
                y: startY,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                size: fishSize,
                angle: Math.random() * Math.PI * 2,
                wiggleOffset: Math.random() * Math.PI * 2,
                rotation: 0
            };
            
            fishes.push(fishObj);
            
            // Remove fish when it goes too far off screen
            setTimeout(() => {
                const index = fishes.indexOf(fishObj);
                if (index > -1) {
                    fishes.splice(index, 1);
                }
                fish.remove();
            }, 30000);
        }
        
        // Physics calculations
        function applyPhysics() {
            // Update each fish's position
            for (const fish of fishes) {
                // Store previous position for collision response
                fish.prevX = fish.x;
                fish.prevY = fish.y;
                
                // Apply basic swimming motion (slight wiggle)
                fish.angle += params.wiggleSpeed;
                const wiggle = Math.sin(fish.angle + fish.wiggleOffset) * params.wiggleIntensity;
                
                // Update velocity with wiggle
                fish.vx += wiggle * 0.1;
                
                // Limit speed
                const speed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
                if (speed > params.maxSpeed) {
                    fish.vx = (fish.vx / speed) * params.maxSpeed;
                    fish.vy = (fish.vy / speed) * params.maxSpeed;
                }
                
                // Apply gravity (slight downward tendency)
                fish.vy += 0.02;
                
                // Mouse repelling effect
                const dx = fish.x - mouse.x;
                const dy = fish.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < params.mouseRepelRadius) {
                    const force = (params.mouseRepelRadius - distance) / params.mouseRepelRadius * params.mouseRepelStrength;
                    const angle = Math.atan2(dy, dx);
                    
                    fish.vx += Math.cos(angle) * force * 0.1;
                    fish.vy += Math.sin(angle) * force * 0.1;
                }
                
                // Update position
                fish.x += fish.vx;
                fish.y += fish.vy;
                
                // Boundary checks (bounce off edges)
                if (fish.x < 0) {
                    fish.x = 0;
                    fish.vx *= -0.5;
                }
                if (fish.x > window.innerWidth) {
                    fish.x = window.innerWidth;
                    fish.vx *= -0.5;
                }
                if (fish.y < -50) {
                    fish.y = -50;
                    fish.vy *= -0.2;
                }
            }
            
            // Fish-to-fish collisions
            for (let i = 0; i < fishes.length; i++) {
                for (let j = i + 1; j < fishes.length; j++) {
                    const fish1 = fishes[i];
                    const fish2 = fishes[j];
                    
                    const dx = fish1.x - fish2.x;
                    const dy = fish1.y - fish2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (fish1.size + fish2.size) * 0.5;
                    
                    if (distance < minDistance) {
                        // Collision detected - calculate bounce
                        const angle = Math.atan2(dy, dx);
                        const overlap = minDistance - distance;
                        
                        // Reposition fish to prevent overlap
                        const moveX = Math.cos(angle) * overlap * 0.5;
                        const moveY = Math.sin(angle) * overlap * 0.5;
                        
                        fish1.x += moveX;
                        fish1.y += moveY;
                        fish2.x -= moveX;
                        fish2.y -= moveY;
                        
                        // Calculate bounce physics
                        const nx = dx / distance;
                        const ny = dy / distance;
                        
                        // Dot product of velocity and normal
                        const p1 = fish1.vx * nx + fish1.vy * ny;
                        const p2 = fish2.vx * nx + fish2.vy * ny;
                        
                        // Conservation of momentum with some elasticity loss
                        const m1 = fish1.size * 0.1;
                        const m2 = fish2.size * 0.1;
                        const elasticity = 0.8;
                        
                        const newP1 = (p1 * (m1 - m2) + 2 * m2 * p2) / (m1 + m2) * elasticity;
                        const newP2 = (p2 * (m2 - m1) + 2 * m1 * p1) / (m1 + m2) * elasticity;
                        
                        // Update velocities
                        fish1.vx += (newP1 - p1) * nx;
                        fish1.vy += (newP1 - p1) * ny;
                        fish2.vx += (newP2 - p2) * nx;
                        fish2.vy += (newP2 - p2) * ny;
                    }
                }
            }
        }
        
        // Update fish positions and rendering
        function updateFish() {
            applyPhysics();
            
            for (const fish of fishes) {
                // Calculate rotation based on movement direction
                const moveX = fish.x - fish.prevX;
                const moveY = fish.y - fish.prevY;
                
                if (moveX !== 0 || moveY !== 0) {
                    fish.rotation = Math.atan2(moveY, moveX) * (180 / Math.PI);
                }
                
                // Update position and rotation
                fish.element.style.left = fish.x + 'px';
                fish.element.style.top = fish.y + 'px';
                fish.element.style.transform = `rotate(${fish.rotation}deg)`;
                
                // Remove if too far off screen
                if (fish.y > window.innerHeight + 100 || 
                    fish.x < -100 || 
                    fish.x > window.innerWidth + 100) {
                    const index = fishes.indexOf(fish);
                    if (index > -1) {
                        fishes.splice(index, 1);
                    }
                    fish.element.remove();
                }
            }
            
            requestAnimationFrame(updateFish);
        }
        
        // Create fish periodically
        function startFishStorm() {
            createFish();
            const interval = 300 + Math.random() * 700; // 300-1000ms
            setTimeout(startFishStorm, interval);
        }
        
        // Start the fish storm and physics
        document.getElementById("fishStart").onclick = () => {
            // Create initial fish
            for (let i = 0; i < 10; i++) {
                createFish();
            }
            startFishStorm();
            updateFish();
        };
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Keep fish from getting stuck at edges
            for (const fish of fishes) {
                if (fish.x > window.innerWidth) fish.x = window.innerWidth;
                if (fish.y > window.innerHeight) fish.y = window.innerHeight;
            }
        });