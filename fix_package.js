const fs = require('fs');

const files = [
  'app-senior/google-services.json',
  'app-senior/app.json',
  'app-volunteer/google-services.json',
  'app-volunteer/app.json'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/com\.Sahara\.senior/g, 'com.sahara.senior');
    c = c.replace(/com\.Sahara\.volunteer/g, 'com.sahara.volunteer');
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
});
