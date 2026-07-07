const https = require('https');
const fs = require('fs');

https.get('https://storage.googleapis.com/eas-workflows-production/logs/0a51c30e-d9ef-44f0-bb7c-54295a07cfb5/422d6823-b8a3-4e63-9d44-2e491ce3b25c/2026-06-26T13%3A51%3A40Z-3f6f4e99-50b9-47f7-9d1c-8f7e529a867a.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260626%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260626T140946Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=9de50466823a4f00fb68bcdcb4c4a2b9207cdb0885055d45ecdd7c67e10e5c15598f5e7aade5a6dc45544b1987297407ef9803f29c0c3d2130bc83ff2f4d3a5b62c2ac1bd7195d849fc83e2e2bd8ed70f7d67a45a5ac5e0edbc106ae3c3795e5a246f697eaffc64b57f3217e962768b43bde440957151cfa10ca747c54076d4101309abce702a0044bcf6b9045b0bfee0bf771144136d26c91f0b1dea31e8b4d93d92bea5ab3db7fcaf248f0ad4380c8d1b7d4010df63ae113391a3cea1d8f8cfc6fc073115e5a4d61dc5cb4a6e94c9330b62b47f8de8783faf57fbee45ff7a39fca7c74c7891b20646b0d3224feb2b181d414eac509a1a8bf26eec93e032d39', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk.toString('utf8'));
  res.on('end', () => {
    const lines = data.trim().split('\n');
    const msgs = lines.map(l => {
      try {
        return JSON.parse(l).msg || '';
      } catch (e) {
        return l;
      }
    });
    console.log(msgs.slice(-200).join('\n'));
  });
});
