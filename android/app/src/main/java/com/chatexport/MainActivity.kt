package com.chatexport

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.net.toFile
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import androidx.documentfile.provider.DocumentFile
import android.widget.Toast
import android.os.Handler
import android.os.Looper

class MainActivity : ReactActivity() {

    private var pendingFilePath: String? = null // Store the copied file path temporarily

    override fun getMainComponentName(): String = "ChatExport"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent) // Handle intent on first launch
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent) // Update the intent in the current activity
        handleIntent(intent) // Handle new intents while app is running
    }

    private fun handleIntent(intent: Intent?) {
        Log.d("MainActivity", "=== handleIntent called ===")
        Log.d("MainActivity", "Intent: $intent")
        Log.d("MainActivity", "Intent action: ${intent?.action}")
        Log.d("MainActivity", "Intent data: ${intent?.data}")
        Log.d("MainActivity", "Intent clipData: ${intent?.clipData}")
        Log.d("MainActivity", "Intent flags: ${intent?.flags}")

        // Show toast to confirm our code is running
        if (intent?.action == Intent.ACTION_SEND || intent?.action == Intent.ACTION_VIEW) {
            showToast("📥 Received file from WhatsApp...")
        }

        // Extract URI from intent - check multiple sources
        val uri = extractUriFromIntent(intent)

        if (uri != null) {
            Log.d("MainActivity", "✅ Intent URI found: $uri")
            Log.d("MainActivity", "URI scheme: ${uri.scheme}")
            Log.d("MainActivity", "URI authority: ${uri.authority}")

            // IMPORTANT: Copy the file immediately while we have temporary permission
            // WhatsApp's content provider grants temporary read access only to the
            // activity that receives the intent. We must copy now before permission expires.
            val localFilePath = copyContentUriToLocalFile(uri, intent)

            if (localFilePath != null) {
                showToast("✅ File copied successfully!")
                if (isReactContextReady()) {
                    Log.d("MainActivity", "✅ React context ready, sending local path to React Native")
                    sendFilePathToReactNative(localFilePath)
                } else {
                    Log.d("MainActivity", "⏳ React context NOT ready, storing as pendingFilePath")
                    pendingFilePath = localFilePath // Store the local file path temporarily
                }
            } else {
                Log.e("MainActivity", "❌ Failed to copy content URI to local file")
                showToast("❌ Failed to copy file - Permission denied")
                // Send error event to React Native so it knows what happened
                sendErrorToReactNative("PERMISSION_DENIED", "Could not access WhatsApp file. Please try exporting again or use the file picker.")
            }
        } else {
            Log.d("MainActivity", "❌ No URI found in intent")
        }

        Log.d("MainActivity", "======================")
    }

    /**
     * Extract URI from intent - handles ACTION_VIEW, ACTION_SEND, and clipData
     */
    @Suppress("DEPRECATION")
    private fun extractUriFromIntent(intent: Intent?): Uri? {
        if (intent == null) return null

        val action = intent.action

        // For ACTION_SEND, check EXTRA_STREAM first (this is how WhatsApp shares files)
        if (action == Intent.ACTION_SEND) {
            val extraStream: Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
            } else {
                intent.getParcelableExtra(Intent.EXTRA_STREAM)
            }

            if (extraStream != null) {
                Log.d("MainActivity", "📎 Found URI in EXTRA_STREAM: $extraStream")
                return extraStream
            }
        }

        // For ACTION_SEND_MULTIPLE, get first URI from the list
        if (action == Intent.ACTION_SEND_MULTIPLE) {
            val uriList: ArrayList<Uri>? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
            } else {
                intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM)
            }

            if (!uriList.isNullOrEmpty()) {
                Log.d("MainActivity", "📎 Found ${uriList.size} URIs in EXTRA_STREAM, using first")
                return uriList[0]
            }
        }

        // Check intent.data (for ACTION_VIEW)
        if (intent.data != null) {
            Log.d("MainActivity", "📎 Found URI in intent.data: ${intent.data}")
            return intent.data
        }

        // Check clipData as fallback
        if (intent.clipData != null && intent.clipData!!.itemCount > 0) {
            val clipUri = intent.clipData!!.getItemAt(0)?.uri
            if (clipUri != null) {
                Log.d("MainActivity", "📎 Found URI in clipData: $clipUri")
                return clipUri
            }
        }

        return null
    }

    /**
     * Copies a content:// URI to a local file immediately while we have permission.
     * This is necessary because WhatsApp's MediaProvider is not exported and only
     * grants temporary read access to the receiving activity.
     */
    private fun copyContentUriToLocalFile(uri: Uri, intent: Intent?): String? {
        Log.d("MainActivity", "=== copyContentUriToLocalFile ===")
        Log.d("MainActivity", "Source URI: $uri")
        Log.d("MainActivity", "URI authority: ${uri.authority}")
        Log.d("MainActivity", "URI path: ${uri.path}")

        // For file:// URIs, just return the path directly
        if (uri.scheme == "file") {
            val path = uri.path
            Log.d("MainActivity", "File URI, returning path directly: $path")
            return path
        }

        // Check and log intent flags
        val intentFlags = intent?.flags ?: 0
        Log.d("MainActivity", "Intent flags: $intentFlags (binary: ${Integer.toBinaryString(intentFlags)})")
        Log.d("MainActivity", "FLAG_GRANT_READ_URI_PERMISSION: ${intentFlags and Intent.FLAG_GRANT_READ_URI_PERMISSION != 0}")

        // Add read permission to intent if not present (for Android 10+)
        intent?.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

        // Try to take persistable URI permission (may fail for temporary grants, which is OK)
        try {
            val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
            contentResolver.takePersistableUriPermission(uri, takeFlags)
            Log.d("MainActivity", "✅ Took persistable URI permission")
        } catch (e: SecurityException) {
            Log.d("MainActivity", "ℹ️ Could not take persistable permission (normal for temp grants): ${e.message}")
        }

        // Try multiple approaches to copy the file
        val destFileName = "whatsapp_export_${UUID.randomUUID()}.zip"
        val destFile = File(cacheDir, destFileName)
        Log.d("MainActivity", "Destination: ${destFile.absolutePath}")

        // Approach 1: Direct contentResolver.openInputStream
        var inputStream = tryOpenInputStream(uri)

        // Approach 2: Using DocumentFile API (better for scoped storage)
        if (inputStream == null) {
            Log.d("MainActivity", "Trying DocumentFile API...")
            inputStream = tryDocumentFileApproach(uri)
        }

        // Approach 3: Try with AssetFileDescriptor
        if (inputStream == null) {
            Log.d("MainActivity", "Trying AssetFileDescriptor...")
            inputStream = tryAssetFileDescriptor(uri)
        }

        if (inputStream == null) {
            Log.e("MainActivity", "❌ All approaches failed to open input stream")
            return null
        }

        // Copy the file
        return try {
            FileOutputStream(destFile).use { outputStream ->
                val buffer = ByteArray(8192)
                var bytesRead: Int
                var totalBytes = 0L

                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                    totalBytes += bytesRead
                }

                Log.d("MainActivity", "✅ File copied successfully, total bytes: $totalBytes")
            }
            inputStream.close()
            destFile.absolutePath
        } catch (e: Exception) {
            Log.e("MainActivity", "❌ Error writing file: ${e.message}", e)
            inputStream.close()
            null
        }
    }

    private fun tryOpenInputStream(uri: Uri): java.io.InputStream? {
        return try {
            Log.d("MainActivity", "Approach 1: contentResolver.openInputStream...")
            val stream = contentResolver.openInputStream(uri)
            if (stream != null) {
                Log.d("MainActivity", "✅ Approach 1 succeeded")
            }
            stream
        } catch (e: SecurityException) {
            Log.e("MainActivity", "❌ Approach 1 SecurityException: ${e.message}")
            null
        } catch (e: Exception) {
            Log.e("MainActivity", "❌ Approach 1 failed: ${e.message}")
            null
        }
    }

    private fun tryDocumentFileApproach(uri: Uri): java.io.InputStream? {
        return try {
            val documentFile = DocumentFile.fromSingleUri(this, uri)
            if (documentFile != null && documentFile.exists() && documentFile.canRead()) {
                Log.d("MainActivity", "DocumentFile exists: ${documentFile.name}, size: ${documentFile.length()}")
                val stream = contentResolver.openInputStream(documentFile.uri)
                if (stream != null) {
                    Log.d("MainActivity", "✅ Approach 2 (DocumentFile) succeeded")
                }
                stream
            } else {
                Log.d("MainActivity", "DocumentFile: exists=${documentFile?.exists()}, canRead=${documentFile?.canRead()}")
                null
            }
        } catch (e: SecurityException) {
            Log.e("MainActivity", "❌ Approach 2 SecurityException: ${e.message}")
            null
        } catch (e: Exception) {
            Log.e("MainActivity", "❌ Approach 2 failed: ${e.message}")
            null
        }
    }

    private fun tryAssetFileDescriptor(uri: Uri): java.io.InputStream? {
        return try {
            val afd = contentResolver.openAssetFileDescriptor(uri, "r")
            if (afd != null) {
                Log.d("MainActivity", "✅ Approach 3 (AssetFileDescriptor) succeeded, length: ${afd.length}")
                afd.createInputStream()
            } else {
                null
            }
        } catch (e: SecurityException) {
            Log.e("MainActivity", "❌ Approach 3 SecurityException: ${e.message}")
            null
        } catch (e: Exception) {
            Log.e("MainActivity", "❌ Approach 3 failed: ${e.message}")
            null
        }
    }

    private fun showToast(message: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        }
    }

    private fun sendErrorToReactNative(errorCode: String, errorMessage: String) {
        val reactInstanceManager: ReactInstanceManager = reactNativeHost.reactInstanceManager
        val reactContext: ReactContext? = reactInstanceManager.currentReactContext

        if (reactContext != null) {
            try {
                val errorData = "ERROR:$errorCode:$errorMessage"
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("IntentError", errorData)
            } catch (e: Exception) {
                Log.e("MainActivity", "Failed to send error to React Native: ${e.message}")
            }
        }
    }

    private fun isReactContextReady(): Boolean {
        val reactInstanceManager: ReactInstanceManager = reactNativeHost.reactInstanceManager
        val reactContext: ReactContext? = reactInstanceManager.currentReactContext
        return reactContext != null && reactContext.hasActiveCatalystInstance()
    }

    private fun sendFilePathToReactNative(filePath: String) {
        Log.d("MainActivity", "=== sendFilePathToReactNative ===")
        Log.d("MainActivity", "File path to send: $filePath")

        val reactInstanceManager: ReactInstanceManager = reactNativeHost.reactInstanceManager
        val reactContext: ReactContext? = reactInstanceManager.currentReactContext

        Log.d("MainActivity", "ReactContext: $reactContext")
        Log.d("MainActivity", "Has catalyst instance: ${reactContext?.hasActiveCatalystInstance()}")

        if (reactContext != null) {
            try {
                // Send as file:// URI for consistency with React Native file handling
                val fileUri = "file://$filePath"
                Log.d("MainActivity", "📤 Emitting IntentReceived event with file path: $fileUri")
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("IntentReceived", fileUri)
                Log.d("MainActivity", "✅ Event emitted successfully")
            } catch (e: Exception) {
                Log.e("MainActivity", "❌ Error emitting event: ${e.message}", e)
            }
        } else {
            Log.d("MainActivity", "❌ ReactContext is null. Cannot send file path.")
        }

        Log.d("MainActivity", "========================")
    }

    override fun onResume() {
        super.onResume()
        Log.d("MainActivity", "=== onResume called ===")
        Log.d("MainActivity", "Pending file path: $pendingFilePath")
        Log.d("MainActivity", "React context ready: ${isReactContextReady()}")

        if (pendingFilePath != null && isReactContextReady()) {
            Log.d("MainActivity", "✅ Processing pending file path from onResume")
            sendFilePathToReactNative(pendingFilePath!!)
            pendingFilePath = null // Clear the pending file path
            Log.d("MainActivity", "✅ Pending file path cleared")
        } else if (pendingFilePath != null) {
            Log.d("MainActivity", "⏳ Pending file path exists but React context not ready yet")
        }

        Log.d("MainActivity", "===================")
    }
}
