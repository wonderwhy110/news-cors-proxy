// netlify/functions/proxy.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Разрешаем CORS для всех доменов
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Обрабатываем preflight OPTIONS запрос
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Формируем URL для вашего бэкенда
    const backendUrl = `http://176.123.167.59:3000${event.path.replace('/.netlify/functions/proxy', '')}${event.rawQuery ? '?' + event.rawQuery : ''}`;
    
    console.log('Proxying to:', backendUrl, 'Method:', event.httpMethod);

    // Проксируем запрос к бэкенду
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(event.headers.authorization && { 'Authorization': event.headers.authorization })
      },
      body: event.body ? event.body : undefined
    });

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