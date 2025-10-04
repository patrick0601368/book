# MongoDB Atlas Security Setup

## 1. Network Access (IP Whitelist)

### Add Vercel IP Ranges:
- `76.76.19.0/24`
- `76.76.20.0/24`
- `76.76.21.0/24`
- `76.76.22.0/24`

### Add Your Development IP:
- Click "Add Current IP Address" for your local development

## 2. Database User Security

### Create Dedicated App User:
1. **Database Access** → **Add New Database User**
2. **Authentication Method:** Password
3. **Username:** `learning-platform-app`
4. **Password:** Generate strong password (save it!)
5. **Database User Privileges:** 
   - **Built-in Role:** `readWrite` 
   - **Database:** `learning-platform` (or your database name)

## 3. Connection String Security

### Update your MONGODB_URI:
```
mongodb+srv://learning-platform-app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learning-platform?retryWrites=true&w=majority
```

## 4. Additional Security Measures

### Enable Database Authentication:
- **Security** → **Database Access** → **Enable Authentication**

### Enable Network Encryption:
- **Security** → **Network Security** → **Enable TLS/SSL**

### Enable Audit Logging:
- **Security** → **Audit Logs** → **Enable**

## 5. Application-Level Security

### Environment Variables:
- Store database credentials in environment variables
- Never commit credentials to git
- Use different credentials for development/production

### User Authentication:
- Implement proper user authentication in your app
- Use JWT tokens or sessions
- Validate user permissions before database operations

## 6. Monitoring

### Set up Alerts:
- **Monitoring** → **Alerts** → **Create Alert**
- Monitor for unusual access patterns
- Set up failed login attempt alerts

This ensures only your Vercel app and authenticated users can access the database!
