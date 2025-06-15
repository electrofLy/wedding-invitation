# Wedding Invitation Website

A beautiful, interactive web-based wedding invitation for Ивайло and Стелина's wedding on August 21, 2025. This site
features animated balloons with randomly selected photos, fireworks effects, and a responsive design that works on all
devices.

## Features

- **Interactive Design**: Animated balloons with photos from the couple
- **Random Photo Selection**: Each page load displays different photos from a collection of 37 images
- **Fireworks Animation**: Celebratory fireworks appear throughout the experience
- **Responsive Layout**: Works seamlessly on mobile devices, tablets, and desktops

## Technology Stack

- HTML5, CSS3, JavaScript
- D3.js for advanced animations
- Webpack for bundling and optimization
- CSS animations and transitions
- Open Graph meta tags for social media sharing

## Setup and Development

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:

```
npm start
```

The site will be available at http://localhost:8080 with hot reloading enabled.

### Production Build

Create an optimized build:

```
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Customization

- Image files are stored in the `img` directory and named numerically from 1.jpg to 37.jpg
- The website randomly selects 6 unique images to display on each visit
- Color scheme and styling can be modified in the CSS files in the `css` directory

