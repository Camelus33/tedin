// download-sounds.js
const https = require('https');
const fs = require('fs');
const path = require('path');

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Define sound URLs - using free sounds from freesound.org and similar sites
const sounds = [
  {
    name: 'correct.mp3',
    // Success sound effect
    url: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
  },
  {
    name: 'incorrect.mp3',
    // Error sound effect
    url: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3'
  },
  {
    name: 'stone-place.mp3',
    // Click/placement sound
    url: 'https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3'
  }
];

// Download each sound
sounds.forEach(sound => {
  const filePath = path.join(soundsDir, sound.name);
  const file = fs.createWriteStream(filePath);
  
  console.log(`Downloading ${sound.name}...`);
  
  https.get(sound.url, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${sound.name} successfully`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {}); // Delete the file if there was an error
    console.error(`Error downloading ${sound.name}: ${err.message}`);
  });
}); 