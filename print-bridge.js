#!/usr/bin/env node
'use strict';
// Pont HTTP local pour relayer des octets ESC/POS vers une imprimante TCP.
// Configuration via variables: BRIDGE_HOST (0.0.0.0), BRIDGE_PORT (8080), PRINTER_IP (172.29.29.150), PRINTER_PORT (9100).
const http = require('http');
const net = require('net');
const args = process.argv.slice(2);
function arg(name, fallback) { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; }
const host = arg('host', process.env.BRIDGE_HOST || '0.0.0.0');
const bridgePort = Number(arg('port', process.env.BRIDGE_PORT || 8080));
const printerHost = arg('printer-ip', process.env.PRINTER_IP || '172.29.29.150');
const printerPort = Number(arg('printer-port', process.env.PRINTER_PORT || 9100));
const LIMIT = 1024 * 1024;
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/print') { res.writeHead(404); return res.end('POST /print attendu'); }
  const chunks = []; let size = 0; let ended = false;
  req.on('data', chunk => { size += chunk.length; if (size > LIMIT) { ended = true; res.writeHead(413); res.end('Ticket trop volumineux'); req.destroy(); } else chunks.push(chunk); });
  req.on('end', () => {
    if (ended) return;
    const payload = Buffer.concat(chunks);
    if (!payload.length) { res.writeHead(400); return res.end('Corps vide'); }
    const socket = net.createConnection({ host: printerHost, port: printerPort }); let done = false;
    const fail = message => { if (done) return; done = true; res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(message); socket.destroy(); };
    socket.setTimeout(5000, () => fail('Délai TCP dépassé'));
    socket.once('connect', () => { socket.end(payload, () => { if (done) return; done = true; res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Octets transmis'); }); });
    socket.once('error', err => fail('Connexion imprimante impossible: ' + err.message));
  });
});
server.listen(bridgePort, host, () => console.log(`Pont ${host}:${bridgePort}/print → ${printerHost}:${printerPort}`));
