const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    // Initialize Google Sheets API with read/write scope
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = event.queryStringParameters?.sheet || 'Jobs'; // Default to Jobs; supports Users

    if (event.httpMethod === 'GET') {
      // Fetch data from specified sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:ZZ`, // Broader range for flexibility
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify([]),
        };
      }

      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || ''; // Handle empty cells
        });
        return item;
      });

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else if (event.httpMethod === 'POST') {
      // Add new row to specified sheet
      const body = JSON.parse(event.body || '{}');
      const values = Object.values(body); // Assumes body matches sheet columns
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:A`, // Append to first column
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });

      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Row added successfully' }),
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }
  } catch (error) {
    console.error('API Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request', details: error.message }),
    };
  }
};
