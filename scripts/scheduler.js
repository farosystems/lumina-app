#!/usr/bin/env node

/**
 * Script para procesar posts programados
 * Este script debe ejecutarse cada minuto mediante un cron job
 * 
 * Ejemplo de cron job:
 * * * * * * /usr/bin/node /path/to/your/app/scripts/scheduler.js
 */

const https = require('https');
const http = require('http');

// Configuración
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SCHEDULER_ENDPOINT = '/api/scheduler/process';

function makeRequest() {
  return new Promise((resolve, reject) => {
    const url = `${APP_URL}${SCHEDULER_ENDPOINT}`;
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LUMINA-Scheduler/1.0'
      },
      timeout: 30000 // 30 segundos timeout
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          reject(new Error(`Error parsing response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function runScheduler() {
  const startTime = new Date();
  console.log(`🕐 [${startTime.toISOString()}] Iniciando procesamiento de posts programados...`);
  
  try {
    const result = await makeRequest();
    
    if (result.status === 200) {
      console.log(`✅ [${new Date().toISOString()}] Procesamiento completado exitosamente`);
      console.log(`📊 Resultados: ${JSON.stringify(result.data, null, 2)}`);
    } else {
      console.error(`❌ [${new Date().toISOString()}] Error en el procesamiento: ${result.status}`);
      console.error(`📄 Respuesta: ${JSON.stringify(result.data, null, 2)}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error ejecutando scheduler:`, error.message);
  }
  
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  console.log(`⏱️ [${endTime.toISOString()}] Duración total: ${duration}ms`);
}

// Ejecutar el scheduler
runScheduler().catch(console.error);

