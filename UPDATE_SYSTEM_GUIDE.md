# Update System Diagnostic Guide

## Current Issues Identified

Based on your code analysis, here are the potential issues with your update system:

### 1. **Development vs Production Environment**
- Updates are typically disabled in development mode (`__DEV__` is true)
- Your app needs to be built with EAS Build to enable updates

### 2. **Configuration Issues**
- Missing `enabled: true` in app.json updates configuration
- Missing `fallbackToCacheTimeout` setting

### 3. **Error Handling**
- Limited error handling in the update process
- No retry mechanism for failed updates

## How to Test Your Update System

### Step 1: Add the Test Screen to Your Navigation

Add this to your navigation stack to access the test screen:

```javascript
// In your navigation file
import UpdateTestScreen from './screens/UpdateTestScreen';

// Add to your stack navigator
<Stack.Screen name="UpdateTest" component={UpdateTestScreen} />
```

### Step 2: Run the Diagnostic

1. Navigate to the UpdateTest screen
2. Press "Run Diagnostic" to see detailed information about your update system
3. Check the console logs for additional details

### Step 3: Test in Production Build

Updates only work in production builds, not in development:

```bash
# Build a production APK
eas build --platform android --profile preview

# Or build for internal testing
eas build --platform android --profile preview --distribution internal
```

## Common Issues and Solutions

### Issue 1: "Updates not enabled"
**Cause**: Running in development mode or missing EAS build
**Solution**: 
- Build with EAS: `eas build --platform android --profile preview`
- Install the built APK on a device

### Issue 2: "No update available"
**Cause**: No new update published to your channel
**Solution**:
- Publish an update: `eas update --channel main`
- Make sure your app.json version is incremented

### Issue 3: "Update URL error"
**Cause**: Network issues or incorrect project ID
**Solution**:
- Check your internet connection
- Verify the project ID in app.json matches your EAS project

### Issue 4: "Error fetching update"
**Cause**: Network timeout or server issues
**Solution**:
- Add retry logic
- Check Expo's status page for service issues

## Enhanced Update System

I've improved your update system with:

1. **Better Error Handling**: More detailed error messages and logging
2. **Retry Logic**: Automatic retries for failed updates
3. **User Feedback**: Clear status messages during update process
4. **Diagnostic Tools**: Comprehensive testing screen

## Testing Checklist

- [ ] Run diagnostic in development mode (should show "Updates not enabled")
- [ ] Build production APK with EAS
- [ ] Install production APK on device
- [ ] Run diagnostic in production (should show "Updates enabled")
- [ ] Publish a test update: `eas update --channel main`
- [ ] Test update process in production app

## Commands to Test Updates

```bash
# Build production app
eas build --platform android --profile preview

# Publish an update
eas update --channel main

# Check update status
eas update:view

# List all updates
eas update:list
```

## Version Management

Make sure to increment your version when publishing updates:

```json
{
  "expo": {
    "version": "1.0.5",  // Increment this
    "runtimeVersion": "1.0.5"  // And this
  }
}
```

## Debugging Tips

1. **Check Console Logs**: Look for detailed update logs
2. **Use the Test Screen**: Run diagnostics to identify issues
3. **Verify Network**: Ensure device has internet connection
4. **Check EAS Project**: Verify project ID and channel configuration
5. **Test on Real Device**: Updates don't work in simulators

## Next Steps

1. Add the UpdateTestScreen to your navigation
2. Build a production APK with EAS
3. Test the update system on a real device
4. Publish a test update to verify the system works
5. Monitor the diagnostic results to identify any remaining issues 