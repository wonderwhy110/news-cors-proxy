// netlify/functions/proxy.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const backendUrl = `http://176.123.167.59:3000${event.path.replace('/.netlify/functions/proxy', '')}${event.rawQuery ? '?' + event.rawQuery : ''}`;
    
    console.log('Proxying to:', backendUrl, 'Method:', event.httpMethod);

    // Для файлов используем multipart/form-data
    const contentType = event.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const fetchOptions = {
      method: event.httpMethod,
      headers: {}
    };

    // Копируем заголовки, кроме host и connection
    Object.keys(event.headers).forEach(key => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        fetchOptions.headers[key] = event.headers[key];
      }
    });

    // Для multipart передаем тело как есть
    if (event.body && !isMultipart) {
      fetchOptions.body = event.body;
    } else if (event.body && isMultipart) {
      // Для multipart используем Buffer
      fetchOptions.body = Buffer.from(event.body, 'base64');
    }

    const response = await fetch(backendUrl, fetchOptions);
    const data = await response.text();

    return {
      statusCode: response.status,
      headers,
      body: data
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      })
    };
  }
};