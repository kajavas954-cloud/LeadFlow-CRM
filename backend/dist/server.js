import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` LeadFlow CRM Server Started successfully!`);
    console.log(` Running on port: http://localhost:${PORT}`);
    console.log(` Documentation:   http://localhost:${PORT}/docs`);
    console.log(`=========================================`);
});
