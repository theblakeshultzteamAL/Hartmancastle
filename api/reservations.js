export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const token = process.env.HOSPITABLE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'HOSPITABLE_TOKEN not configured' });
  }

  try {
    const response = await fetch('https://public.api.hospitable.com/v2/reservations?per_page=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
