import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

async function runMigrations() {
  // Use url-service DataSource as it has both entities
  try {
    const urlServicePath = path.resolve(__dirname, '../services/url-service/src/database/database.config.ts');
    const urlDataSourceModule = await import(urlServicePath);
    
    if (urlDataSourceModule.default && urlDataSourceModule.default instanceof DataSource) {
      const dataSource = urlDataSourceModule.default;
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      
      console.log('Running migrations...');
      await dataSource.runMigrations();
      await dataSource.destroy();
      console.log('Migrations completed successfully!');
      return;
    }
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
}

runMigrations().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});

