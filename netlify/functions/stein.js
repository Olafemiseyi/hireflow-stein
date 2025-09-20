const { google } = require('googleapis');

// Generate a random 5-character alphanumeric Job ID (e.g., M12T5)
function generateRandomJobId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let jobId = '';
  for (let i = 0; i < 5; i++) {
    jobId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return jobId;
}

exports.handler = async (event) => {
  try {
    // Initialize Google Sheets API with authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet name from query parameter (default: Jobs)
    const sheetName = event.queryStringParameters?.sheet || 'Jobs';

    // Handle GET request
    if (event.httpMethod === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response.data.values || []),
      };
    }

    // Handle POST request with random Job ID
    if (event.httpMethod === 'POST') {
      if (sheetName !== 'Jobs') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'POST only supported for Jobs sheet' }),
        };
      }

      const body = JSON.parse(event.body);
      // Generate random Job ID
      body['Job ID'] = generateRandomJobId();

      // Explicitly order values to match Jobs tab columns
      const columns = [
        'Job ID',
        'Job Title',
        'Company',
        'Location',
        'Job Type',
        'Salary',
        'Description',
        'Apply Link',
        'Logo URL',
        'Posted Date',
        'Deadline'
      ];
      const values = columns.map(col => body[col] || ''); // Use empty string for missing fields

      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A:K`, // Explicitly target columns A-K
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Row added successfully', jobId: body['Job ID'] }),
      };
    }

    // Handle unsupported methods
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to process request', details: error.message }),
    };
  }
};
