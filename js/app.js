import * as d3 from 'd3';

// Wait for the document to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
  // Function to create an array with consecutive numbers from 1 to max
  function createConsecutiveArray(max) {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Function to get n random unique numbers from the array
  function getRandomUniqueNumbers(array, count) {
    const result = [];
    const arrayCopy = [...array]; // Create a copy to avoid modifying the original

    for (let i = 0; i < count; i++) {
      if (arrayCopy.length === 0) break; // Safety check
      // Get random index
      const randomIndex = Math.floor(Math.random() * arrayCopy.length);
      // Remove and get the element at the random index
      const randomElement = arrayCopy.splice(randomIndex, 1)[0];
      result.push(randomElement);
    }

    return result;
  }

  // Create array with numbers 1-38
  const imageNumbers = createConsecutiveArray(37);
  // Get 6 random unique numbers
  const selectedNumbers = getRandomUniqueNumbers(imageNumbers, 6);
  // Create image paths from the selected numbers
  const imagePaths = selectedNumbers.map(num => `img/${num}.jpg`);

  // Preload images to get their dimensions
  const imageObjects = imagePaths.map(path => {
    const img = new Image();
    img.src = path;
    return img;
  });

  // Configuration
  const config = {
    balloonCount: 6,
    minSize: 120,
    maxSize: 200,
    minSpeed: 0.5,
    maxSpeed: 1.5,
    minDrift: 0.2,
    maxDrift: 0.8
  };

  // String styles for balloons
  const stringColors = [
    '#5A7652',
    '#5A7652',
    '#5A7652',
    '#c2bdbd',
    '#c2bdbd',
    '#c2bdbd'
  ];

  const stringStyles = [
    { width: 2, pattern: null }, // Solid, thin
    { width: 3, pattern: null }, // Solid, medium
    { width: 4, pattern: null }, // Solid, thick
    { width: 2, pattern: null }, // Solid, thin
    { width: 3, pattern: null }, // Solid, medium
    { width: 2, pattern: null }  // Solid, thin
  ];

  // Initialize SVG container
  const svg = d3.select('#balloon-container')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  // Define balloon shape as a clip path
  const defs = svg.append('defs');

  // Create balloon clips and balloons
  const balloons = [];

  // Wait for images to load
  Promise.all(imageObjects.map(img => {
    return new Promise(resolve => {
      if (img.complete) {
        resolve(img);
      } else {
        img.onload = () => resolve(img);
      }
    });
  })).then(loadedImages => {
    createBalloons(loadedImages);
    // Start animation
    animate();

    // Set up the expand button functionality
    setupExpandButton();

    // Start automatic fireworks
    startRandomFireworks();
  });

  // Function to handle the expand button click
  function setupExpandButton() {
    const expandBtn = document.getElementById('expand-btn');
    const hiddenContent = document.getElementById('hidden-content');
    const balloonContainer = document.getElementById('balloon-container');
    const fireworkContainer = document.getElementById('firework-container');

    if (expandBtn && hiddenContent) {
      // Add both click and touch events for better mobile support
      ['click', 'touchend'].forEach(eventType => {
        expandBtn.addEventListener(eventType, function(e) {
          // Prevent default behavior for touch events
          if (e.type === 'touchend') {
            e.preventDefault();
          }

          // Toggle the expanded class on the content
          hiddenContent.classList.toggle('expanded');
          // Toggle the expanded class on the button to rotate it
          expandBtn.classList.toggle('expanded');

          // Check if content is expanded
          const isExpanded = hiddenContent.classList.contains('expanded');

          // Handle balloon and firework visibility with fade effect
          if (isExpanded) {
            // Fade out balloons and fireworks
            if (balloonContainer) {
              balloonContainer.style.opacity = '0';
              // After fade completes, set display to none for complete removal
              setTimeout(() => {
                balloonContainer.style.display = 'none';
              }, 500); // Match transition duration
            }

            if (fireworkContainer) {
              fireworkContainer.style.opacity = '0';
              // After fade completes, set display to none for complete removal
              setTimeout(() => {
                fireworkContainer.style.display = 'none';
              }, 500); // Match transition duration
            }
          } else {
            // Immediately show and fade in balloons and fireworks when collapsing
            if (balloonContainer) {
              balloonContainer.style.display = 'block';
              // Small delay to ensure display change is processed before opacity transition
              setTimeout(() => {
                balloonContainer.style.opacity = '1';
              }, 10);
            }

            if (fireworkContainer) {
              fireworkContainer.style.display = 'block';
              // Small delay to ensure display change is processed before opacity transition
              setTimeout(() => {
                fireworkContainer.style.opacity = '1';
              }, 10);
            }

            // Create fireworks when the button is clicked to collapse
            createFireworks(expandBtn);
          }
        });
      });
    }
  }

  // Function to create fireworks animation
  function createFireworks(sourceElement = null) {
    const fireworkContainer = document.getElementById('firework-container');
    if (!fireworkContainer) {
      console.error('Firework container not found!');
      return;
    }

    console.log('Creating fireworks');

    // If sourceElement is provided, use its position, otherwise use random position
    let startX, startY;
    if (sourceElement) {
      // Get button position to determine where fireworks start
      const buttonRect = sourceElement.getBoundingClientRect();
      startX = buttonRect.left + buttonRect.width / 2;
      startY = buttonRect.top + buttonRect.height / 2;
    } else {
      // Random position across the screen
      startX = Math.random() * window.innerWidth;
      startY = Math.random() * window.innerHeight;
    }

    // Create a new firework
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = `${startX}px`;
    firework.style.top = `${startY}px`;

    // Number of particles in the explosion - increased from 30 to 50
    const particleCount = 50;

    // Create the particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `particle color-${Math.floor(Math.random() * 8) + 1}`;

      // Random angle and distance for the particle
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 100; // Increased distance for larger explosions

      // Set the translate values as CSS variables
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

      firework.appendChild(particle);
    }

    // Add firework to container
    fireworkContainer.appendChild(firework);

    // Trigger animation
    requestAnimationFrame(() => {
      firework.classList.add('active');
    });

    // Remove firework element after animation completes
    setTimeout(() => {
      if (fireworkContainer.contains(firework)) {
        fireworkContainer.removeChild(firework);
      }
    }, 1000);
  }

  // Function to start random fireworks across the screen
  function startRandomFireworks() {
    // Continuously create new fireworks at random intervals
    function createRandomFirework() {
      createFireworks();

      // Schedule next firework with random delay (between 500ms and 2000ms)
      const nextDelay = 500 + Math.random() * 1900;
      setTimeout(createRandomFirework, nextDelay);
    }

    // Start the continuous fireworks after a short delay
    setTimeout(createRandomFirework, 2000);
  }

  function createBalloons(loadedImages) {
    for (let i = 0; i < config.balloonCount; i++) {
      const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
      const width = size;
      const height = size * 1.2;

      // Random initial position
      const x = Math.random() * (window.innerWidth - width);
      const y = Math.random() * (window.innerHeight - height);

      // Create clipPath for balloon shape
      const clipId = `balloon-clip-${i}`;
      const clip = defs.append('clipPath')
        .attr('id', clipId);

      // Balloon shape (main body is oval, small triangle at bottom)
      clip.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', height / 2 - 15)
        .attr('rx', width / 2)
        .attr('ry', height / 2 - 15);

      // Connect triangle to the bottom of the ellipse - adjusted to remove the gap
      const ellipseBottom = height / 2 - 16 + (height / 2 - 16); // Calculate bottom point of ellipse
      clip.append('path')
        .attr('d', `M${width/2 - 16},${ellipseBottom} L${width/2},${ellipseBottom + 20} L${width/2 + 16},${ellipseBottom} Z`)
        .attr('fill', '#fff');

      // Create balloon group
      const balloon = svg.append('g')
        .attr('class', 'balloon')
        .attr('transform', `translate(${x}, ${y})`);

      // Get current image
      const currentImage = loadedImages[i % loadedImages.length];
      const imgWidth = currentImage.width;
      const imgHeight = currentImage.height;

      // Calculate aspect ratio to properly fit image in balloon
      const containerRatio = width / height;
      const imageRatio = imgWidth / imgHeight;

      let scaledWidth, scaledHeight, offsetX, offsetY;

      if (imageRatio > containerRatio) {
        // Image is wider than container
        scaledHeight = height;
        scaledWidth = height * imageRatio;
        offsetX = (width - scaledWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than container
        scaledWidth = width;
        scaledHeight = width / imageRatio;
        offsetX = 0;
        offsetY = (height - scaledHeight) / 2;
      }

      // Add image with clip path
      balloon.append('image')
        .attr('xlink:href', imagePaths[i % imagePaths.length])
        .attr('width', scaledWidth)
        .attr('height', scaledHeight)
        .attr('x', offsetX)
        .attr('y', offsetY)
        .attr('clip-path', `url(#${clipId})`);

      // Add string to balloon with different color and style for each balloon
      const stringLength = 50 + Math.random() * 50;
      const stringColor = stringColors[i % stringColors.length];
      const stringStyle = stringStyles[i % stringStyles.length];

      balloon.append('path')
        .attr('class', 'balloon-string')
        .attr('d', `M${width/2},${height - 14} C${width/2},${height + stringLength/3} ${width/2 + 20},${height + stringLength/2} ${width/2},${height + stringLength}`)
        .attr('fill', 'none')
        .attr('stroke', stringColor)
        .attr('stroke-width', stringStyle.width)
        .attr('stroke-dasharray', stringStyle.pattern);

      // Store balloon data for animation
      balloons.push({
        element: balloon,
        x,
        y,
        width,
        height,
        speedX: (Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed) * (Math.random() > 0.5 ? 1 : -1),
        drift: Math.random() * (config.maxDrift - config.minDrift) + config.minDrift,
        theta: Math.random() * Math.PI * 2
      });
    }
  }

  // Animation loop
  function animate() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    balloons.forEach(balloon => {
      // Update position with slight drift
      balloon.theta += balloon.drift * 0.01;
      balloon.x += balloon.speedX + Math.sin(balloon.theta) * 0.5;
      balloon.y += balloon.speedY;

      // Bounce off edges
      if (balloon.x < 0 || balloon.x > width - balloon.width) {
        balloon.speedX *= -1;
        balloon.x = Math.max(0, Math.min(width - balloon.width, balloon.x));
      }

      if (balloon.y < 0 || balloon.y > height - balloon.height) {
        balloon.speedY *= -1;
        balloon.y = Math.max(0, Math.min(height - balloon.height, balloon.y));
      }

      // Update balloon position
      balloon.element.attr('transform', `translate(${balloon.x}, ${balloon.y})`);
    });

    requestAnimationFrame(animate);
  }

  // Handle window resize
  function resizeHandler() {
    svg.attr('width', window.innerWidth).attr('height', window.innerHeight);
  }

  window.addEventListener('resize', resizeHandler);
  resizeHandler();
});

