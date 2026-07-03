const fs = require('fs');
const https = require('https');

const en = require('./src/locales/en.json');
const targetLangs = ['bn', 'mr', 'te', 'ta', 'gu', 'kn'];

async function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    // If there's a placeholder like {{year}} or {{UserName}}, we might have issues but let's just encode it
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0]) {
            let translated = '';
            for (let i = 0; i < parsed[0].length; i++) {
              translated += parsed[0][i][0];
            }
            resolve(translated);
          } else {
            resolve(text);
          }
        } catch (e) {
          resolve(text); // fallback
        }
      });
    }).on('error', (e) => {
      resolve(text); // fallback
    });
  });
}

async function translateObj(obj, targetLang) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      console.log(`Translating: ${obj[key]}`);
      result[key] = await translateText(obj[key], targetLang);
      // Avoid rate limit
      await new Promise(r => setTimeout(r, 300));
    } else if (typeof obj[key] === 'object') {
      result[key] = await translateObj(obj[key], targetLang);
    }
  }
  return result;
}

async function main() {
  for (const lang of targetLangs) {
    console.log(`\n\nStarting translation for ${lang}...`);
    const translated = await translateObj(en, lang);
    fs.writeFileSync(`./src/locales/${lang}.json`, JSON.stringify(translated, null, 2), 'utf-8');
    console.log(`Finished ${lang}.json`);
  }
}

main().catch(console.error);
