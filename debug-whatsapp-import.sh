#!/bin/bash

# WhatsApp Import Debug Script
# This script monitors all logs related to WhatsApp import

echo "======================================"
echo "WhatsApp Import Debug Monitor"
echo "======================================"
echo ""
echo "Starting log monitoring..."
echo "Press Ctrl+C to stop"
echo ""
echo "When you're ready:"
echo "1. Make sure app is running"
echo "2. Navigate to Chat screen"
echo "3. Tap 'Import' button"
echo "4. Share WhatsApp chat export"
echo "5. Watch this terminal for logs"
echo ""
echo "--------------------------------------"
echo ""

# Monitor both Android logcat and Metro logs
adb logcat -c  # Clear logcat first

adb logcat | grep -E "MainActivity|IntentReceived|ReactNativeJS|Groq|SSE" --line-buffered | while read line; do
    # Color code different types of logs
    if echo "$line" | grep -q "MainActivity"; then
        echo -e "\033[0;36m[ANDROID] $line\033[0m"  # Cyan for Android
    elif echo "$line" | grep -q "IntentReceived"; then
        echo -e "\033[0;32m[EVENT] $line\033[0m"    # Green for events
    elif echo "$line" | grep -q "Groq\|SSE"; then
        echo -e "\033[0;33m[API] $line\033[0m"      # Yellow for API
    elif echo "$line" | grep -q "ERROR\|Error\|❌"; then
        echo -e "\033[0;31m[ERROR] $line\033[0m"    # Red for errors
    elif echo "$line" | grep -q "✅"; then
        echo -e "\033[0;32m[SUCCESS] $line\033[0m"  # Green for success
    else
        echo -e "\033[0;37m[LOG] $line\033[0m"      # White for other logs
    fi
done
