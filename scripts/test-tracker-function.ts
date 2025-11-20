import { analyzeFleetMaintenance } from '../app/lib/esg/maintenance-tracker';

async function test() {
  console.log('🧪 Testing maintenance-tracker function...\n');
  
  try {
    const result = await analyzeFleetMaintenance('cmfj0oxqm004udomy7qivgt18');
    
    console.log('✅ Function executed successfully!\n');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Function failed!');
    console.error('Error:', error.message);
  }
}

test();
