const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Jobs'; // Assuming you named your sheet "Jobs"

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const headers = rows[0];
    const jobs = rows.slice(1).map(row => {
      const job = {};
      headers.forEach((header, index) => {
        job[header] = row[index];
      });
      return job;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(jobs),
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' }),
    };
  }
};
