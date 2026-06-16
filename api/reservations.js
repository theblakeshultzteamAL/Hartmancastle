export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const token = process.env.HOSPITABLE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'HOSPITABLE_TOKEN not configured' });
  }

  try {
    const propsRes = await fetch('https://public.api.hospitable.com/v2/properties', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const propsData = await propsRes.json();
    const properties = propsData.data || [];
    if (!properties.length) {
      return res.status(404).json({ error: 'No properties found on this account' });
    }

    const propertyParams = properties.map(p => `properties[]=${p.id}`).join('&');
    const resRes = await fetch(`https://public.api.hospitable.com/v2/reservations?${propertyParams}&per_page=50`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const resData = await resRes.json();
    res.status(resRes.status).json(resData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
