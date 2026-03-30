# 📱 WhatsApp Chat Import - Complete Testing Guide

## Prerequisites Checklist

### ✅ 1. Environment Setup
```bash
# Check .env file exists
ls -la .env

# Verify required variables (run in project root)
cat .env
```

**Required variables:**
```env
baseUrl=https://your-backend-api.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
googleLoginKey=your-google-oauth-client-id
```

**Get Groq API Key:**
1. Go to https://console.groq.com/
2. Sign up/Login
3. Go to API Keys section
4. Create new key
5. Copy to `.env` file as `GROQ_API_KEY=gsk_...`

### ✅ 2. Build the App
**IMPORTANT:** Native code changes require a fresh build!

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Build and run
npm run android

# Or for development
npx react-native run-android
```

### ✅ 3. User Authentication
- Open app
- Login/Register with email & password
- Verify you see the bottom tab navigation
- **CRITICAL:** You must be logged in for import to work

### ✅ 4. Device/Emulator Requirements
- Android device or emulator
- WhatsApp installed
- At least one chat with messages
- Internet connection (for Groq API)

---

## Complete Step-by-Step Test

### Phase 1: Prepare WhatsApp Export

#### Step 1.1: Export Chat from WhatsApp
1. Open WhatsApp
2. Open any chat (individual or group)
3. Tap **⋮** (three dots) in top right
4. Select **More** → **Export chat**
5. Choose:
   - **"Without media"** (for quick test)
   - **"Include media"** (for full test with images/videos)
6. WhatsApp creates ZIP file (may take 1-2 minutes)

#### Step 1.2: Verify Export Created
- You should see: "Preparing chat for export..."
- Then: Share menu appears with ZIP file

---

### Phase 2: Import to ChatExport App

#### Step 2.1: Navigate to Chat Screen
1. In ChatExport app, go to **Shop Tab** (home)
2. Tap **"Photo Book"** button
3. Select any book format (Standard or Square)
4. Tap **"Let's Create Your Design"** button
5. You arrive at Chat screen (empty state)

#### Step 2.2: Initiate Import
1. Tap **"Import"** button (big + icon)
2. WhatsApp opens automatically
3. **CRITICAL CHECK:** ChatExport app should **remain in memory** (not fully close)

#### Step 2.3: Share from WhatsApp
1. In WhatsApp share menu, select **"ChatExport"**
   - If not visible, tap **"More apps"** and find ChatExport
2. **What should happen:**
   - ChatExport app comes to foreground
   - You should see Chat screen again
   - Loading spinner appears immediately

#### Step 2.4: Monitor Processing
**Watch for these indicators:**

1. **Loading Spinner** (should appear within 1-2 seconds)
2. **Console Logs** (open Metro bundler):
   ```
   Setting up IntentReceived listener...
   IntentReceived event triggered with URI: content://...
   Screen is focused, processing URI...
   Starting to load WhatsApp export from URI: ...
   Converting content:// URI to file path...
   File copied to: ...
   Unzipping file...
   Unzipped to: ...
   Found X media files and text file
   Chat content length: XXXX
   ```

3. **Success Alert** (after 2-10 seconds):
   ```
   Success
   Chat loaded successfully!
   Found X media files
   ```

4. **Messages Appear** (incrementally over 10-60 seconds):
   - Messages populate in real-time as AI parses them
   - You should see chat bubbles appearing
   - Message count updates at top

---

### Phase 3: Verify Data Display

#### Step 3.1: Check Messages Visible
**Expected Results:**
- ✅ Chat bubbles appear in list
- ✅ Sender names visible (unless "Hide names" enabled)
- ✅ Timestamps visible
- ✅ Different colors for sent/received messages
- ✅ Smooth scrolling

#### Step 3.2: Check Message Types
**For "Without media" export:**
- ✅ Text messages display correctly
- ✅ Line breaks preserved
- ✅ Emojis visible

**For "Include media" export:**
- ✅ Image messages show thumbnail
- ✅ Video messages show play button
- ✅ Audio messages show waveform/icon

#### Step 3.3: Check Message Count
Look at header: Should show count like "450 messages"

---

## 🐛 Troubleshooting Guide

### Issue 1: No Loading Spinner After Share

**Symptoms:**
- App returns to Chat screen
- No loading indicator
- No messages appear
- Console silent (no "IntentReceived" log)

**Diagnosis Steps:**
```bash
# 1. Check Android logs
adb logcat | grep MainActivity

# Look for:
# - "Intent URI: content://..."
# - "ReactContext not ready"
```

**Possible Causes & Fixes:**

**A. Intent not received by MainActivity**
```bash
# Check AndroidManifest.xml intent filters
cat android/app/src/main/AndroidManifest.xml | grep -A 10 intent-filter

# Verify: Should have filters for application/zip MIME types
```
**Fix:** Rebuild app after verifying manifest

**B. React context not ready**
```bash
# Check logs for "ReactContext not ready"
adb logcat | grep "ReactContext"
```
**Fix:** MainActivity stores `pendingUri` and sends when ready (already implemented)

**C. Screen not focused**
```bash
# Check Metro logs for:
"Screen not focused, ignoring intent"
```
**Fix:** Ensure you're on Chat screen when WhatsApp returns
- Don't minimize app
- Don't navigate away during export

**D. User not logged in**
```bash
# Check Metro logs for:
"Setting up IntentReceived listener..."
```
If missing → No listener set up because `user` is null

**Fix:** Login before importing

---

### Issue 2: Loading Starts But No Messages Appear

**Symptoms:**
- Loading spinner shows
- Console logs show "Unzipping file..." and "Found X media files"
- But messages never populate
- Loading eventually stops with no result

**Diagnosis Steps:**
```bash
# Check Metro logs for:
grep "SSE error" <metro-logs>
grep "API Key" <metro-logs>
grep "Stream parse error" <metro-logs>
```

**Possible Causes & Fixes:**

**A. Missing/Invalid Groq API Key**
```bash
# Check .env file
cat .env | grep GROQ_API_KEY

# Should show: GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```
**Fix:**
1. Get key from https://console.groq.com/
2. Add to `.env`:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
3. **RESTART Metro bundler:**
   ```bash
   # Kill metro (Ctrl+C)
   # Clear cache
   npx react-native start --reset-cache
   ```
4. Rebuild app:
   ```bash
   npm run android
   ```

**B. Network Error (No Internet)**
```bash
# Test API connectivity
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.groq.com/openai/v1/models
```
**Fix:** Connect to internet and retry

**C. Groq API Rate Limiting**
**Symptom:** Console shows "429" or "rate limit" errors

**Fix:**
- Wait a few minutes
- Check your Groq account usage limits
- Upgrade plan if needed

**D. Malformed Chat Text**
**Symptom:** Console shows JSON parse errors

**Fix:** Export a different chat from WhatsApp and try again

---

### Issue 3: Partial Messages Load Then Stop

**Symptoms:**
- Some messages appear (e.g., 50 out of 500)
- Loading stops
- Alert: "Couldn't parse all chunks"

**Possible Causes:**
- Network dropped during streaming
- API timeout
- Chunk parsing error

**Fix:**
1. Clear existing messages (tap "Clear" in header)
2. Retry import with stable internet connection
3. Try smaller chat export (shorter date range)

---

### Issue 4: Messages Appear But Media Missing

**Symptoms:**
- Text messages display correctly
- Image/video messages show placeholder or broken image
- No thumbnail visible

**Diagnosis:**
```bash
# Check if media files were extracted
adb shell ls /data/data/com.chatexport/files/extracted/

# Should show: chat.txt, IMG-*.jpg, VID-*.mp4, etc.
```

**Possible Causes & Fixes:**

**A. WhatsApp Export Without Media**
**Fix:** Export chat again with "Include media" option

**B. Media Files Not Matched**
**Symptom:** Console shows "localPath: undefined"

**Fix:** Check filename matching logic
- AI must extract exact filename from chat text
- Filenames are case-sensitive
- Special characters may cause mismatch

**C. File Permission Error**
**Fix:**
```bash
# Grant storage permissions
adb shell pm grant com.chatexport android.permission.READ_EXTERNAL_STORAGE
adb shell pm grant com.chatexport android.permission.WRITE_EXTERNAL_STORAGE
```

---

### Issue 5: App Crashes on Import

**Symptoms:**
- App crashes immediately when selecting ChatExport
- App restarts to splash screen

**Diagnosis:**
```bash
# Check crash logs
adb logcat | grep AndroidRuntime
adb logcat | grep FATAL
```

**Common Crashes:**

**A. Out of Memory**
**Symptom:** Logcat shows "OutOfMemoryError"

**Fix:**
- Export smaller chat (fewer messages/media)
- In `AndroidManifest.xml`, verify:
  ```xml
  android:largeHeap="true"
  ```

**B. File Access Crash**
**Symptom:** "FileNotFoundException" or "Permission denied"

**Fix:** Grant permissions (see Issue 4C)

---

## 📊 Expected Performance Metrics

### Small Chat (50-100 messages, no media)
- **Unzip time:** 1-2 seconds
- **Parsing time:** 5-15 seconds
- **Total time:** ~20 seconds
- **Messages appear:** Incrementally every 1-2 seconds

### Medium Chat (500 messages, 50 media files)
- **Unzip time:** 3-5 seconds
- **Parsing time:** 30-60 seconds
- **Total time:** ~1 minute
- **Messages appear:** Incrementally in batches

### Large Chat (2000+ messages, 200+ media)
- **Unzip time:** 10-15 seconds
- **Parsing time:** 2-5 minutes
- **Total time:** ~5 minutes
- **Messages appear:** Continuously in real-time

**Note:** Parsing is done in 8KB chunks, so messages populate progressively.

---

## 🧪 Advanced Diagnostics

### Enable Verbose Logging

**Add to `chat.tsx` useEffect (line 178):**
```typescript
const subscription = eventEmitter.addListener('IntentReceived', uri => {
  console.log('=== INTENT DEBUG ===');
  console.log('URI:', uri);
  console.log('User:', !!user);
  console.log('isFocused:', isFocused);
  console.log('==================');

  // ... rest of code
});
```

### Monitor API Calls

**Add to `useChatParser.ts` before SSE (line 195):**
```typescript
console.log('=== GROQ API CALL ===');
console.log('Chunk:', index + 1, '/', chunks.length);
console.log('Chunk length:', chunk.length);
console.log('API Key:', Config.GROQ_API_KEY?.substring(0, 10) + '...');
console.log('====================');
```

### Check State Updates

**Add to `chat.tsx` useEffect for chatMessages:**
```typescript
useEffect(() => {
  console.log('chatMessages updated:', chatMessages.length, 'messages');
}, [chatMessages]);
```

---

## 🔍 Verification Commands

### Check Environment Variables (Runtime)
```bash
# In React Native code
import Config from 'react-native-config';
console.log('Base URL:', Config.baseUrl);
console.log('API Key exists:', !!Config.GROQ_API_KEY);
```

### Check Extracted Files
```bash
# List extracted directory
adb shell ls -la /data/data/com.chatexport/files/extracted/

# Read first 100 bytes of chat.txt
adb shell head -c 100 /data/data/com.chatexport/files/extracted/*.txt
```

### Check App Storage Permissions
```bash
adb shell dumpsys package com.chatexport | grep permission
```

### Monitor Network Requests
```bash
# Enable network debugging
adb shell setprop log.tag.ReactNativeJS VERBOSE
adb logcat ReactNativeJS:V *:S
```

---

## ✅ Success Criteria

**Import is successful when ALL of these are true:**

1. ✅ Loading spinner appears within 2 seconds of sharing
2. ✅ Success alert shows with media file count
3. ✅ Messages populate in FlashList within 30 seconds
4. ✅ Message count in header matches approximately expected count
5. ✅ Messages are scrollable
6. ✅ Sender names visible (if not hidden)
7. ✅ Timestamps formatted correctly
8. ✅ Images display thumbnails (if "Include media" used)
9. ✅ Can press "Edit" and see configuration options
10. ✅ Can press "Done" and save to backend without errors

---

## 📝 Test Report Template

After testing, fill this out:

```
=== WhatsApp Import Test Report ===

Date: _______________
App Version: _______________
Android Version: _______________
Device: _______________

PREREQUISITES:
- [ ] Logged in as user
- [ ] Groq API key configured
- [ ] WhatsApp installed
- [ ] Internet connected

TEST RESULTS:
- [ ] Intent received by MainActivity
- [ ] Loading indicator appeared
- [ ] ZIP extracted successfully
- [ ] Success alert displayed
- [ ] Messages populated in UI
- [ ] Media thumbnails displayed (if applicable)

CHAT DETAILS:
- Message count (expected): ______
- Message count (actual): ______
- Media files (expected): ______
- Media files (actual): ______
- Parsing time: ______ seconds

ISSUES ENCOUNTERED:
_______________________________________
_______________________________________

CONSOLE ERRORS:
_______________________________________
_______________________________________

STATUS: [ PASS ] [ FAIL ] [ PARTIAL ]
```

---

## 🚀 Quick Test Checklist

Use this for rapid testing:

```
[ ] 1. App built fresh (npm run android)
[ ] 2. User logged in
[ ] 3. Navigate to Chat screen
[ ] 4. Tap "Import"
[ ] 5. WhatsApp opens
[ ] 6. Export chat → Share → ChatExport
[ ] 7. App comes to foreground
[ ] 8. Loading spinner shows
[ ] 9. Success alert appears
[ ] 10. Messages populate
[ ] 11. Can scroll through messages
[ ] 12. Press "Done" successfully
```

---

## 📞 Support

If issues persist after following this guide:

1. **Collect logs:**
   ```bash
   adb logcat > chatexport-logs.txt
   ```

2. **Check these files:**
   - `.env` (Groq API key)
   - `android/app/src/main/AndroidManifest.xml` (intent filters)
   - `android/app/src/main/java/com/chatexport/MainActivity.kt` (event emission)

3. **Document:**
   - Steps taken
   - Expected vs actual behavior
   - Console errors
   - Android logcat errors

4. **Test with dummy data:**
   ```javascript
   // In Chat screen, tap "Load Dummy Data"
   // If this works, issue is with real import flow
   ```
