import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import * as fileManager from './screens/util/file-manager.js';

// Test function to diagnose update system
export const testUpdateSystem = async () => {
  console.log('=== UPDATE SYSTEM DIAGNOSTIC ===');
  
  try {
    // 1. Check if Updates is available
    console.log('1. Updates module available:', !!Updates);
    
    // 2. Check if updates are enabled
    console.log('2. Updates enabled:', Updates.isEnabled);
    
    // 3. Check current update info
    console.log('3. Current update info:');
    console.log('   - Channel:', Updates.channel);
    console.log('   - Update ID:', Updates.updateId);
    console.log('   - Runtime Version:', Updates.runtimeVersion);
    console.log('   - Created At:', Updates.createdAt);
    console.log('   - Manifest:', Updates.manifest);
    
    // 4. Check for available updates
    console.log('4. Checking for updates...');
    const update = await Updates.checkForUpdateAsync();
    console.log('   - Update available:', update.isAvailable);
    console.log('   - Update manifest:', update.manifest);
    
    // 5. Check local storage version
    console.log('5. Local storage version:');
    try {
      const dataUser = await fileManager.read_file("auto.json");
      console.log('   - Stored version:', dataUser?.version);
      console.log('   - App version (app.json):', '1.0.4');
      console.log('   - Runtime version:', Updates.runtimeVersion);
    } catch (error) {
      console.log('   - Error reading local storage:', error.message);
    }
    
    // 6. Test update URL accessibility
    console.log('6. Testing update URL accessibility...');
    try {
      const updateUrl = 'https://u.expo.dev/e2aaec2e-feae-4114-b202-d73b6e6474ae';
      const response = await fetch(updateUrl);
      console.log('   - Update URL accessible:', response.ok);
      console.log('   - Response status:', response.status);
    } catch (error) {
      console.log('   - Update URL error:', error.message);
    }
    
    // 7. Check if we're in development or production
    console.log('7. Environment check:');
    console.log('   - __DEV__:', __DEV__);
    console.log('   - Platform:', Platform.OS);
    
    // 8. Test file system access
    console.log('8. File system access:');
    try {
      const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
      console.log('   - Document directory accessible:', fileInfo.exists);
      console.log('   - Document directory:', FileSystem.documentDirectory);
    } catch (error) {
      console.log('   - File system error:', error.message);
    }
    
    console.log('=== DIAGNOSTIC COMPLETE ===');
    
    return {
      updatesEnabled: Updates.isEnabled,
      updateAvailable: update.isAvailable,
      channel: Updates.channel,
      runtimeVersion: Updates.runtimeVersion
    };
    
  } catch (error) {
    console.error('Diagnostic error:', error);
    return { error: error.message };
  }
};

// Enhanced update check function
export const enhancedCheckUpdate = async () => {
  console.log('=== ENHANCED UPDATE CHECK ===');
  
  try {
    // Check if updates are enabled
    if (!Updates.isEnabled) {
      console.log('Updates not enabled in this environment');
      return { success: false, reason: 'Updates not enabled' };
    }
    
    // Check for updates
    const update = await Updates.checkForUpdateAsync();
    console.log('Update check result:', update);
    
    if (update.isAvailable) {
      console.log('Update available, fetching...');
      
      // Fetch the update
      await Updates.fetchUpdateAsync();
      console.log('Update fetched successfully');
      
      // Reload the app
      await Updates.reloadAsync();
      console.log('App reloaded');
      
      return { success: true, action: 'update_applied' };
    } else {
      console.log('No update available');
      return { success: true, action: 'no_update' };
    }
    
  } catch (error) {
    console.error('Update check error:', error);
    return { success: false, error: error.message };
  }
}; 