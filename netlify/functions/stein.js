const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    if (event.httpMethod === 'POST') {
      const bodyArray = JSON.parse(event.body);
      for (const body of bodyArray) {
        const columns = ['Job ID', 'Job Title', 'Company', 'Location', 'Job Type', 'Salary', 'Description', 'Apply Link', 'Logo URL', 'Posted Date', 'Extra'];
        const values = columns.map(col => body[col] || '');
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Jobs!A:K',
          valueInputOption: 'RAW',
          requestBody: { values: [values] }
        });
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Row added successfully' })
      };
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Jobs!A:K'
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data.values.slice(1))
    };
  } catch (error) {
    console.error('Stein API error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
