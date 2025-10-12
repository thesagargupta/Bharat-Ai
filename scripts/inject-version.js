const fs = require('fs');
const path = require('path');

// Generate version based on current timestamp
const VERSION = Date.now().toString();
const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js');

console.log('🔨 Injecting build version into service worker...');
console.log('📦 Version:', VERSION);

try {
  // Read the service worker file
  let swContent = fs.readFileSync(SW_PATH, 'utf8');
  
  // Replace BUILD_TIMESTAMP with actual timestamp
  swContent = swContent.replace(/BUILD_TIMESTAMP/g, VERSION);
  
  // Write back the modified content
  fs.writeFileSync(SW_PATH, swContent, 'utf8');
  
  console.log('✅ Service worker updated successfully!');
  console.log('📍 File:', SW_PATH);
  console.log('');
} catch (error) {
  console.error('❌ Error updating service worker:', error);
  process.exit(1);
}
