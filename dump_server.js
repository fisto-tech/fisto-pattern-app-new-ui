const http = require('http');
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('---UV_DUMP_START---');
      console.log(body);
      console.log('---UV_DUMP_END---');
      res.end('ok');
      process.exit(0);
    });
  }
});
server.listen(4000, () => console.log('Listening on 4000'));
