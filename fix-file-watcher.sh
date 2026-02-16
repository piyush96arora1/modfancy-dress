#!/bin/bash
# Script to fix file watcher limit issue
# Run this with: bash fix-file-watcher.sh

echo "Current file watcher limit:"
cat /proc/sys/fs/inotify/max_user_watches

echo ""
echo "Increasing file watcher limit to 524288..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf

echo ""
echo "Applying changes..."
sudo sysctl -p

echo ""
echo "New file watcher limit:"
cat /proc/sys/fs/inotify/max_user_watches

echo ""
echo "✅ File watcher limit increased! You may need to restart your dev server."

