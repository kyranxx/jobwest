const https = require('https');
const SENTRY_AUTH_TOKEN = '8fba3c39f6dde46434ebb0a098808bf9683c305bcdd827c4ca2063cc16aad46a';
const ORG_SLUG = 'apollo-tech-sro';
const PROJECT_SLUG = 'javascript-nextjs';

const options = {
  hostname: 'sentry.io',
  path: `/api/0/projects/${ORG_SLUG}/${PROJECT_SLUG}/issues/`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const issues = JSON.parse(data);
      console.log('--- Sentry Issues ---');
      if (issues.length === 0) {
        console.log('No unresolved issues found. The fix was successful!');
      } else {
        console.log(`Found ${issues.length} issue(s). Please check the details below:`);
        issues.forEach(issue => {
          console.log(`Title: ${issue.title}`);
          console.log(`Level: ${issue.level}`);
          console.log(`Events: ${issue.count}`);
          console.log(`Last Seen: ${issue.lastSeen}`);
          console.log(`Link: ${issue.permalink}`);
          console.log('---------------------');
        });
      }
    } else {
      console.error(`Error fetching Sentry issues: ${res.statusCode}`);
      try {
        const errorData = JSON.parse(data);
        console.error('Error details:', errorData.detail);
      } catch (e) {
        console.error('Raw error response:', data);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('Error making the request:', error);
});

req.end();
