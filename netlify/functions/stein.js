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
    // Validate environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID environment variable is missing');
    }
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS environment variable is missing');
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (e) {
      throw new Error('Invalid GOOGLE_CREDENTIALS JSON: ' + e.message);
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    if (event.httpMethod === 'POST') {
      let bodyArray;
      try {
        bodyArray = JSON.parse(event.body);
        if (!Array.isArray(bodyArray)) {
          throw new Error('POST body must be an array');
        }
      } catch (e) {
        throw new Error('Invalid POST body: ' + e.message);
      }

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

    const values = response.data.values || [];
    if (!values.length || values.length === 1) { // Only header row
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(values.slice(1)) // Skip header
    };
  } catch (error) {
    console.error('Stein API error:', error.message, error.stack);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
