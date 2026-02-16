# File Watcher Limit Fix

## The Problem

Your system's file watcher limit (65536) is being exceeded because webpack is trying to watch too many files, including parent directories.

## Why This Happens

1. **System Limit**: Linux has a limit on how many files can be watched simultaneously
2. **Parent Directory Lockfile**: There's a `package-lock.json` in `/home/fa064236/` which makes Next.js think the workspace root is higher up
3. **Webpack Watching**: Webpack tries to watch files for hot reloading

## The Solution

You **MUST** increase the system file watcher limit. This is a one-time system configuration:

```bash
# Increase the limit permanently
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify it worked
cat /proc/sys/fs/inotify/max_user_watches
# Should show: 524288
```

## After Running the Command

1. **Restart your terminal** (or run `sudo sysctl -p` to apply immediately)
2. **Stop your dev server** (Ctrl+C)
3. **Start again**: `npm run dev`

The errors should be gone!

## Why Normal Next.js Projects Don't Have This

- They don't have `next-pwa` modifying webpack
- They don't have lockfiles in parent directories confusing Next.js
- Their system limits are usually higher or they have fewer files

## Current Configuration

- ✅ PWA only applies in production (not in dev)
- ✅ Polling mode enabled as fallback
- ✅ Proper ignore patterns configured
- ⚠️ **Still need to increase system limit** - this is required!

