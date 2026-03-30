package com.chatexport

import android.content.Context
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import android.util.Log

class ContentResolverModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ContentResolverModule"
    }

    @ReactMethod
    fun copyContentUriToFile(contentUriString: String, destinationPath: String, promise: Promise) {
        try {
            Log.d("ContentResolverModule", "=== copyContentUriToFile ===")
            Log.d("ContentResolverModule", "Content URI: $contentUriString")
            Log.d("ContentResolverModule", "Destination: $destinationPath")

            val contentUri = Uri.parse(contentUriString)
            val context: Context = reactApplicationContext

            // Open input stream from content URI using ContentResolver
            val inputStream = context.contentResolver.openInputStream(contentUri)
            if (inputStream == null) {
                Log.e("ContentResolverModule", "❌ Failed to open input stream")
                promise.reject("ERROR", "Failed to open input stream for URI: $contentUriString")
                return
            }

            // Create destination file
            val destinationFile = File(destinationPath)
            destinationFile.parentFile?.mkdirs()

            // Copy from input stream to file
            Log.d("ContentResolverModule", "📋 Copying file...")
            val outputStream = FileOutputStream(destinationFile)

            val buffer = ByteArray(8192)
            var bytesRead: Int
            var totalBytes = 0L

            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                totalBytes += bytesRead
            }

            inputStream.close()
            outputStream.close()

            Log.d("ContentResolverModule", "✅ File copied successfully")
            Log.d("ContentResolverModule", "Total bytes: $totalBytes")
            Log.d("ContentResolverModule", "File exists: ${destinationFile.exists()}")
            Log.d("ContentResolverModule", "File size: ${destinationFile.length()}")

            promise.resolve(destinationPath)
        } catch (e: Exception) {
            Log.e("ContentResolverModule", "❌ Error copying file: ${e.message}", e)
            promise.reject("ERROR", "Failed to copy content URI to file: ${e.message}", e)
        }
    }
}
