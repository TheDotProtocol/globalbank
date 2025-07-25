# 🌙 Daily Sync Guide - Global Dot Bank

## 📅 **Last Updated**: July 21, 2025

---

## 🎯 **Purpose**
This document provides the exact steps to run the nightly user standardization script at 00:00 hrs every night, ensuring all users have consistent features, policies, and UI experience across the Global Dot Bank platform.

---

## ⏰ **Timing Information**

### **Execution Time**
- **Start Time**: 00:00 hrs (midnight) every night
- **Duration**: 30-60 seconds (depending on number of users)
- **Timezone**: Server timezone (UTC recommended)
- **Frequency**: Daily

### **Global Impact**
- **Users Affected**: All users in the database
- **Features Standardized**: 
  - Multi-currency support
  - Fixed deposits
  - Virtual cards
  - E-Checks
  - Transfer limits
  - Interest rates
  - KYC requirements
  - UI/UX features

---

## 🚀 **Manual Execution Steps**

### **Step 1: Navigate to Project Directory**
```bash
cd /Users/macbook/Desktop/globalbank/globalbank
```

### **Step 2: Verify Environment**
```bash
# Check if you're in the correct directory
pwd
# Should show: /Users/macbook/Desktop/globalbank/globalbank

# Verify the script exists
ls -la scripts/nightly-standardization.js
# Should show: -rwxr-xr-x  1 user  staff  [size] [date] scripts/nightly-standardization.js
```

### **Step 3: Run the Standardization Script**
```bash
node scripts/nightly-standardization.js
```

### **Step 4: Monitor Output**
You should see output like this:
```
🌙 Starting nightly user standardization...
⏰ Time: 2025-07-21T00:00:00.000Z
==================================================
📊 Found 150 users to standardize
✅ Standardized: user1@example.com
✅ Standardized: user2@example.com
✅ Standardized: user3@example.com
...
==================================================
🎉 Nightly standardization completed!
⏱️  Duration: 45000ms
✅ Success: 150 users
❌ Errors: 0 users

📝 Log entry: {
  "timestamp": "2025-07-21T00:00:00.000Z",
  "totalUsers": 150,
  "successCount": 150,
  "errorCount": 0,
  "duration": 45000,
  "errors": undefined
}
✅ Nightly standardization script completed successfully
```

---

## 🔄 **Automated Execution (Recommended)**

### **Option 1: Cron Job (Unix/Linux/macOS)**

#### **Step 1: Open Crontab**
```bash
crontab -e
```

#### **Step 2: Add the Cron Entry**
Add this line to run at midnight every day:
```bash
0 0 * * * cd /Users/macbook/Desktop/globalbank/globalbank && node scripts/nightly-standardization.js >> /Users/macbook/Desktop/globalbank/globalbank/logs/nightly-sync.log 2>&1
```

#### **Step 3: Create Log Directory**
```bash
mkdir -p /Users/macbook/Desktop/globalbank/globalbank/logs
```

#### **Step 4: Verify Cron Job**
```bash
crontab -l
# Should show your cron entry
```

### **Option 2: Systemd Timer (Linux)**

#### **Step 1: Create Service File**
```bash
sudo nano /etc/systemd/system/globalbank-standardization.service
```

Add content:
```ini
[Unit]
Description=Global Dot Bank Nightly Standardization
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/Users/macbook/Desktop/globalbank/globalbank
ExecStart=/usr/bin/node scripts/nightly-standardization.js
StandardOutput=append:/Users/macbook/Desktop/globalbank/globalbank/logs/nightly-sync.log
StandardError=append:/Users/macbook/Desktop/globalbank/globalbank/logs/nightly-sync.log
```

#### **Step 2: Create Timer File**
```bash
sudo nano /etc/systemd/system/globalbank-standardization.timer
```

Add content:
```ini
[Unit]
Description=Run Global Dot Bank Standardization Daily
Requires=globalbank-standardization.service

[Timer]
OnCalendar=*-*-* 00:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### **Step 3: Enable and Start**
```bash
sudo systemctl enable globalbank-standardization.timer
sudo systemctl start globalbank-standardization.timer
```

---

## 📊 **Monitoring & Verification**

### **Check Script Status**
```bash
# Check if script ran successfully
tail -f /Users/macbook/Desktop/globalbank/globalbank/logs/nightly-sync.log

# Check last run time
ls -la /Users/macbook/Desktop/globalbank/globalbank/logs/nightly-sync.log
```

### **Verify Database Changes**
```bash
# Connect to database and check user standardization
# (Database-specific commands would go here)
```

### **Check Admin Dashboard**
- Navigate to admin dashboard
- Verify all users have consistent features
- Check KYC status standardization

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Issue 1: Script Permission Denied**
```bash
# Fix: Make script executable
chmod +x scripts/nightly-standardization.js
```

#### **Issue 2: Node.js Not Found**
```bash
# Fix: Use full path to node
which node
# Use the full path in cron: /usr/local/bin/node scripts/nightly-standardization.js
```

#### **Issue 3: Database Connection Error**
```bash
# Fix: Check environment variables
cat .env
# Ensure DATABASE_URL is set correctly
```

#### **Issue 4: Prisma Client Not Generated**
```bash
# Fix: Generate Prisma client
npx prisma generate
```

### **Emergency Manual Run**
If automated execution fails, run manually:
```bash
cd /Users/macbook/Desktop/globalbank/globalbank
node scripts/nightly-standardization.js
```

---

## 📞 **Communication to Users**

### **Standard Message for Users**
> "🔄 **System Maintenance Notice**
> 
> Global Dot Bank performs daily system synchronization at 00:00 UTC (midnight) to ensure all users have access to the latest features and consistent experience.
> 
> **Duration**: 30-60 seconds
> **Impact**: Minimal - you may experience brief delays during this time
> **Frequency**: Daily
> 
> This ensures you always have access to:
> - Multi-currency support
> - Latest interest rates
> - Consistent transfer limits
> - Updated security features
> 
> Thank you for banking with Global Dot Bank! 🏦"

### **For Different Timezones**
- **UTC**: 00:00 (midnight)
- **EST**: 19:00 (7 PM previous day)
- **PST**: 16:00 (4 PM previous day)
- **GMT**: 00:00 (midnight)
- **CET**: 01:00 (1 AM)
- **JST**: 09:00 (9 AM)
- **IST**: 05:30 (5:30 AM)

---

## 📋 **Daily Checklist**

- [ ] Script executed at 00:00 hrs
- [ ] No errors in log file
- [ ] All users standardized successfully
- [ ] Admin dashboard shows consistent features
- [ ] Log file backed up (if needed)
- [ ] Performance metrics recorded

---

## 🔗 **Related Files**

- **Script**: `scripts/nightly-standardization.js`
- **API Endpoint**: `/api/admin/standardize-users`
- **Utility**: `src/lib/user-standardization.ts`
- **Logs**: `logs/nightly-sync.log`

---

## 📞 **Support**

If you encounter any issues:
1. Check the log file first
2. Run the script manually to test
3. Verify database connectivity
4. Contact the development team if needed

**Remember**: This script ensures all users have the same excellent experience with Global Dot Bank! 🌟 