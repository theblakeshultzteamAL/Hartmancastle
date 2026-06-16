const https = require('https');

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const options = { hostname: opts.hostname, path: opts.pathname + opts.search, headers };
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve({ status: resp.statusCode, body: JSON.parse(data) }));
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const token = process.env.HOSPITABLE_TOKEN;
  if (!token) return res.status(500).json({ error: 'No token' });

  try {
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
    const props = await httpsGet('https://public.api.hospitable.com/v2/properties', headers);
    if (!props.body.data?.length) return res.status(200).json({ debug: 'no properties', raw: props.body });

    const params = props.body.data.map(p => `properties[]=${p.id}`).join('&');
    const resos = await httpsGet(`https://public.api.hospitable.com/v2/reservations?${params}&per_page=50`, headers);
    res.status(200).json(resos.body);
  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}
