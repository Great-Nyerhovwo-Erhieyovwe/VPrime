#!/usr/bin/env node

/**
 * Quick Start Script - Starts both backend and frontend
 * Run this: node startup.js
 */

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('  ║  CFD PRO TRADE - QUICK START                               ║');
console.log('  ╚════════════════════════════════════════════════════════════╝\n');

console.log('🚀 Starting services...\n');

// Start backend
console.log('1️⃣  Starting Backend Server (port 4000)...');
const backend = spawn('node', [path.join(__dirname, 'server/index.js')], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: isWindows ? 'cmd.exe' : '/bin/bash'
});

// Start frontend after a delay
setTimeout(() => {
    console.log('\n2️⃣  Starting Frontend Dev Server (port 5173)...');
    const frontend = spawn('node', [path.join(__dirname, 'node_modules/vite/bin/vite.js')], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: isWindows ? 'cmd.exe' : '/bin/bash'
    });

    console.log('\n✨ Services started!');
    console.log('   Backend:  http://localhost:4000');
    console.log('   Frontend: http://localhost:5173\n');

    const cleanup = () => {
        console.log('\n\n👋 Shutting down...');
        backend.kill();
        frontend.kill();
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}, 2000);

backend.on('error', (err) => {
    console.error('Backend error:', err);
});
