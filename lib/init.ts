import { initializeMqttService } from '@/lib/mqtt-service';
import { runMigration } from '@/lib/migrate';

let isInitialized = false;

export async function initializeApp() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('[INIT] Starting application...');
    
    // Run database migration
    await runMigration();
    
    // Initialize MQTT service
    initializeMqttService();
    
    isInitialized = true;
    console.log('[INIT] ✓ Application ready');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}
