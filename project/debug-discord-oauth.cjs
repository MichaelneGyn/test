#!/usr/bin/env node

/**
 * Discord OAuth Debug Script
 * 
 * This script helps debug Discord OAuth configuration issues
 * by showing current environment variables and generating the correct URLs.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

function loadEnvFile(filename) {
  const envPath = path.join(__dirname, filename);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  }
  return {};
}

const localEnv = loadEnvFile('.env');
const prodEnv = loadEnvFile('.env.production');

console.log('\n🔍 Discord OAuth Configuration Debug\n');
console.log('=' .repeat(50));

// Current environment detection
const currentPort = process.env.PORT || '5173';
const isProduction = process.argv.includes('--production');

console.log(`\n📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🌐 Current Port: ${currentPort}`);

// Show configuration
const env = isProduction ? prodEnv : localEnv;

console.log('\n🔧 Discord OAuth Configuration:');
console.log('-'.repeat(30));
console.log(`Client ID: ${env.VITE_DISCORD_CLIENT_ID || 'NOT SET'}`);
console.log(`Client Secret: ${env.VITE_DISCORD_CLIENT_SECRET ? 'SET (' + env.VITE_DISCORD_CLIENT_SECRET.length + ' chars)' : 'NOT SET'}`);
console.log(`Redirect URI: ${env.VITE_DISCORD_REDIRECT_URI || 'NOT SET'}`);

// Generate OAuth URL
if (env.VITE_DISCORD_CLIENT_ID) {
  const redirectUri = env.VITE_DISCORD_REDIRECT_URI || `http://localhost:${currentPort}/auth/callback`;
  const scopes = ['identify', 'email', 'guilds'];
  const state = Math.random().toString(36).substring(2, 15);
  
  const params = new URLSearchParams({
    client_id: env.VITE_DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state: state
  });
  
  const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  
  console.log('\n🔗 Generated OAuth URL:');
  console.log('-'.repeat(30));
  console.log(authUrl);
  
  console.log('\n✅ Required Discord Application Settings:');
  console.log('-'.repeat(40));
  console.log('In your Discord Developer Portal (https://discord.com/developers/applications):');
  console.log('1. Go to OAuth2 → Redirects');
  console.log('2. Add these redirect URIs:');
  console.log(`   • http://localhost:5173/auth/callback (development)`);
  console.log(`   • https://mdbot-dashboard.squareweb.app/auth/callback (production)`);
  console.log('3. Save changes');
} else {
  console.log('\n❌ Error: VITE_DISCORD_CLIENT_ID not found!');
  console.log('Please check your .env file.');
}

console.log('\n🚀 Backend Configuration:');
console.log('-'.repeat(25));
console.log(`Backend URL: ${env.VITE_BACKEND_URL || 'http://localhost:3002'}`);
console.log(`API URL: ${env.VITE_API_URL || 'http://localhost:3002'}`);

console.log('\n📝 Usage:');
console.log('-'.repeat(10));
console.log('Development: node debug-discord-oauth.js');
console.log('Production:  node debug-discord-oauth.js --production');
console.log('\n');