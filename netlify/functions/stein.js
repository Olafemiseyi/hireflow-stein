const { google } = require('googleapis');

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
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = event.queryStringParameters?.sheet || 'Jobs';
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data.values || []),
      };
    }

    if (event.httpMethod === 'POST') {
      if (sheetName !== 'Jobs') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'POST only supported for Jobs sheet' }),
        };
      }
      
      // FIX: Get the first object from the parsed body array.
      const body = JSON.parse(event.body)[0];

      body['Job ID'] = generateRandomJobId();
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
      const values = columns.map(col => body[col] || '');
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A:K`,
        valueInputOption: 'RAW',
        requestBody: { values: [values] },
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Row added successfully', jobId: body['Job ID'] }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process request', details: error.message }),
    };
  }
};
