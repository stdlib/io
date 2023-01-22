const send = require('../helpers/send.js');
const generateBoundary = require('../helpers/generate_boundary.js');

/**
* Perform HTTP POST request (multipart/form-data)
* @param {string} url The URL to make an HTTP(S) request to
* @param {string} authorization HTTP Authorization header value. If "Bearer " or "Basic " prefixes are not included, "Bearer " will be assumed.
* @param {object} headers Custom HTTP request headers
* @param {object} params The request form payload
* @returns {object} response
* @ {number} statusCode
* @ {object} headers
* @ {object} data
*/
module.exports = async (url, authorization = null, headers = {}, params = {}) => {

  const boundary = generateBoundary();
  headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
  const body = Object.keys(params).map(key => {
    const value = params[key];
    return [
      `--${boundary}`,
      `Content-Disposition: form-data; name="${key}"`,
      (
        Buffer.isBuffer(value)
          ? `Content-Type: application/octet-stream`
          : typeof value === 'object'
            ? `Content-Type: application/json`
            : `Content-Type: text/plain`
      ),
      ``,
      (
        Buffer.isBuffer(value)
          ? value.toString('latin1')
          : typeof value === 'object'
            ? JSON.stringify(value)
            : value
      ),
      `--${boundary}--`
    ].join(`\r\n`);
  }).join(`\r\n`);

  let result = await send('POST', url, {}, authorization, headers, null, body);
  return {
    statusCode: result.statusCode,
    headers: result.headers,
    data: result.json
  };

};