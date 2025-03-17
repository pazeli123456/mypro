const fs = require('fs').promises;
const path = require('path');

// קריאה מקובץ JSON
const readJSON = async (fileName) => {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${fileName}:`, err.message);
        // החזר מערך ריק אם הקובץ לא נמצא
        return [];
    }
};

// כתיבה לקובץ JSON
const writeJSON = async (fileName, data) => {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        
        // וודא שספריית היעד קיימת
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // כתוב את הקובץ
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error(`Error writing ${fileName}:`, err.message);
        throw err;
    }
};

module.exports = {
    readJSON,
    writeJSON
};