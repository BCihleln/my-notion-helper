const API_BASE = 'https://api.notion.com/v1';

function getHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2026-03-11',
    'Content-Type': 'application/json'
  };
}

async function fetchNotionApi(endpoint, method, token, body = null) {
  const options = {
    method,
    headers: getHeaders(token),
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return fetch(`${API_BASE}${endpoint}`, options);
}

export async function getNotionEntity(id, token) {
  // Try fetching as page
  let res = await fetchNotionApi(`/pages/${id}`, 'GET', token);
  let data = null;

  if (res.ok) {
    data = await res.json();
    // Re-fetch from database endpoint if it's a database to get database-specific fields
    if (data.object === 'database') {
      res = await fetchNotionApi(`/databases/${id}`, 'GET', token);
      if (res.ok) data = await res.json();
    }
  } else {
    // Fallback to database
    res = await fetchNotionApi(`/databases/${id}`, 'GET', token);
    if (res.ok) data = await res.json();
  }

  if (!res.ok || !data) {
    throw new Error('Failed to fetch page/database. Is it shared with your integration?');
  }

  return {
    type: data.object, // 'page' or 'database'
    data
  };
}

export async function updateNotionEntity(id, type, properties, token) {
  const endpoint = type === 'database' ? `/databases/${id}` : `/pages/${id}`;
  const patchRes = await fetchNotionApi(endpoint, 'PATCH', token, properties);

  if (!patchRes.ok) {
    throw new Error(patchRes.statusText);
  }

  return await patchRes.json();
}
