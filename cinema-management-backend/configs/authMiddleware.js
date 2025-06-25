const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

// קריאת הרשאות מקובץ JSON
const readPermissions = async () => {
   try {
       const filePath = path.join(__dirname, '../data/Permissions.json');
       const data = await fs.readFile(filePath, 'utf8');
       return JSON.parse(data);
   } catch (err) {
       console.error('Error reading Permissions.json:', err);
       return [];
   }
};

const authenticateToken = async (req, res, next) => {
   // עקוף אימות עבור נתיבי התחברות ויצירת משתמש
   if (req.path.includes('/auth/') || 
       (req.path.includes('/api/auth') && 
        (req.method === 'POST' || req.method === 'OPTIONS'))) {
       return next();
   }

   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (!token) {
       return res.status(401).json({ error: 'Authentication token required' });
   }

   try {
       const decoded = jwt.verify(token, JWT_SECRET);
       
       // בדיקה מול קובץ ההרשאות
       const permissions = await readPermissions();
       const user = permissions.find(u => u.userName === decoded.userName);

       if (!user) {
           return res.status(401).json({ error: 'User not found' });
       }

       req.user = {
           userId: user.id,
           userName: user.userName,
           permissions: user.permissions || []  // הוספת בדיקה למקרה שאין הרשאות
       };
       next();
   } catch (err) {
       if (err.name === 'TokenExpiredError') {
           return res.status(401).json({ error: 'Token expired' });
       }
       return res.status(403).json({ error: 'Invalid token' });
   }
};

const checkPermission = (requiredPermissions) => {
   return async (req, res, next) => {
       try {
           // וודא שיש משתמש מאומת
           if (!req.user || !req.user.userId) {
               return res.status(401).json({ error: 'Unauthorized' });
           }

           const permissionHierarchy = {
            'View Subscriptions': ['Create Subscriptions', 'Update Subscriptions', 'Delete Subscriptions', 'Manage Subscriptions'],
            'View Movies': ['Create Movies', 'Update Movies', 'Delete Movies', 'Manage Movies'],
            'View Members': ['Create Members', 'Update Members', 'Delete Members', 'Manage Members'],
            'Manage Users': ['View Users', 'Create Users', 'Update Users', 'Delete Users']
           };

           // בדיקת הרשאות
           const hasPermission = 
           Array.isArray(requiredPermissions) 
               ? requiredPermissions.some(permission => 
                   req.user.permissions.includes(permission) || 
                   (permissionHierarchy[permission] && 
                    permissionHierarchy[permission].some(p => 
                        req.user.permissions.includes(p)
                    ))
                 )
               : (req.user.permissions.includes(requiredPermissions) || 
                  (permissionHierarchy[requiredPermissions] && 
                   permissionHierarchy[requiredPermissions].some(p => 
                       req.user.permissions.includes(p)
                   )));

           if (!hasPermission) {
               return res.status(403).json({ 
                   error: 'Insufficient permissions',
                   requiredPermissions,
                   userPermissions: req.user.permissions
               });
           }

           next();
       } catch (err) {
           console.error('Permission check error:', err);
           res.status(500).json({ error: 'Permission check failed' });
       }
   };
};

const checkAdmin = async (req, res, next) => {
   try {
       if (!req.user || !req.user.userId) {
           return res.status(401).json({ error: 'Unauthorized' });
       }

       // בדיקת משתמש מהרשאות
       const permissions = await readPermissions();
       const user = permissions.find(u => u.userName === req.user.userName);
       
       if (!user || !user.permissions.includes('Manage Users')) {
           return res.status(403).json({ error: 'Admin access required' });
       }

       next();
   } catch (err) {
       console.error('Admin check error:', err);
       res.status(500).json({ error: 'Admin check failed' });
   }
};

module.exports = {
   authenticateToken,
   checkPermission,
   checkAdmin
};