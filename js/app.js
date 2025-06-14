import * as d3 from 'd3';

// Image paths
const imagePaths = [
  'img/2F2098DB-9E71-4BD2-BA08-A895D157C5BB_1_105_c.jpeg',
  'img/50C2DACD-F075-49E6-8B95-1BDF4C76824C_1_105_c.jpeg',
  'img/62CF9EC7-484C-4C7F-B425-7EDBCB6074D5_1_105_c.jpeg',
  'img/7A295514-B6D0-44CD-B664-5FE67B69E682_1_105_c.jpeg',
  'img/BADDDF87-012D-4209-ACDF-C753E1F93E50_1_105_c.jpeg',
  'img/E8BCB92C-2940-49F6-913A-6D6BB97F5648_1_105_c.jpeg'
];

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
  '#FF5252', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#FF9800'  // Orange
];

const stringStyles = [
  { width: 2, pattern: null }, // Solid, thin
  { width: 3, pattern: null }, // Solid, medium
  { width: 4, pattern: null }, // Solid, thick
  { width: 2, pattern: null }, // Solid, thin (was dashed)
  { width: 3, pattern: null }, // Solid, medium (was dashed)
  { width: 2, pattern: null }  // Solid, thin (was dotted)
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
});

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

