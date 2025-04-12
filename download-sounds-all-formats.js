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
    name: 'correct',
    // Success sound effects in different formats
    formats: {
      mp3: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      ogg: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.ogg',
      wav: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.wav'
    }
  },
  {
    name: 'incorrect',
    // Error sound effects in different formats
    formats: {
      mp3: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3',
      ogg: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.ogg',
      wav: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.wav'
    }
  },
  {
    name: 'stone-place',
    // Click/placement sound in different formats
    formats: {
      mp3: 'https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3',
      ogg: 'https://cdn.freesound.org/previews/240/240776_4107740-lq.ogg',
      wav: 'https://cdn.freesound.org/previews/240/240776_4107740-lq.wav'
    }
  }
];

// Function to download a file
const downloadFile = (url, filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filePath}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, response => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filePath} successfully`);
        resolve();
      });
      
      file.on('error', err => {
        fs.unlink(filePath, () => {});
        console.error(`Error writing ${filePath}: ${err.message}`);
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${filePath}: ${err.message}`);
      reject(err);
    });
  });
};

// Process all sounds in parallel
const downloadPromises = [];

sounds.forEach(sound => {
  // Download each format
  Object.entries(sound.formats).forEach(([format, url]) => {
    const fileName = `${sound.name}.${format}`;
    const filePath = path.join(soundsDir, fileName);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File ${fileName} already exists, skipping`);
      return;
    }
    
    downloadPromises.push(downloadFile(url, filePath));
  });
});

// Create a fallback HTML5 audio player for testing
const audioPlayerPath = path.join(soundsDir, 'test-audio.html');
const audioPlayerContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Audio Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .player { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
    button { padding: 5px 10px; margin-right: 10px; }
  </style>
</head>
<body>
  <h1>Audio Test Page</h1>
  <p>This page tests the audio files in different formats.</p>
  
  ${sounds.map(sound => `
    <div class="player">
      <h3>${sound.name}</h3>
      <audio id="${sound.name}">
        ${Object.entries(sound.formats).map(([format]) => 
          `<source src="${sound.name}.${format}" type="audio/${format === 'mp3' ? 'mpeg' : format}">`
        ).join('\n        ')}
        Your browser does not support the audio element.
      </audio>
      <button onclick="document.getElementById('${sound.name}').play()">Play</button>
      <button onclick="document.getElementById('${sound.name}').pause()">Pause</button>
    </div>
  `).join('\n  ')}
  
  <script>
    // Preload all audio
    window.onload = () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => audio.load());
    };
  </script>
</body>
</html>
`;

// Write the HTML test page
fs.writeFileSync(audioPlayerPath, audioPlayerContent);
console.log(`Created test audio player at ${audioPlayerPath}`);

// Wait for all downloads to complete
Promise.all(downloadPromises)
  .then(() => {
    console.log('All audio files downloaded successfully!');
  })
  .catch(err => {
    console.error('Error downloading some files:', err);
  }); 