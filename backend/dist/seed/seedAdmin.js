"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'jhenkar1234@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jhenkar@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Platform Administrator';
const seedAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB for Admin Account Initialization...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');
        // Check if an Admin with this email exists
        let admin = await User_1.User.findOne({ email: ADMIN_EMAIL });
        if (admin) {
            console.log(`ℹ️ Admin account [${ADMIN_EMAIL}] found. Updating credentials...`);
            admin.name = ADMIN_NAME;
            admin.fullName = ADMIN_NAME;
            admin.role = 'ADMIN';
            admin.status = 'ACTIVE';
            admin.emailVerified = true;
            admin.password = ADMIN_PASSWORD; // Pre-save hook hashes this with bcrypt
            await admin.save();
        }
        else {
            console.log(`✨ Creating new Administrator account [${ADMIN_EMAIL}]...`);
            admin = await User_1.User.create({
                name: ADMIN_NAME,
                fullName: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                phone: '+91 98765 43210',
                role: 'ADMIN',
                status: 'ACTIVE',
                emailVerified: true,
                city: 'Jaipur',
                state: 'Rajasthan',
            });
        }
        // Log seed event in Audit Log
        await AuditLog_1.AuditLog.create({
            adminId: admin._id,
            adminEmail: admin.email,
            action: 'ADMIN_SEED',
            targetType: 'SYSTEM',
            targetId: admin._id.toString(),
            details: {
                message: 'Administrator account seeded via secure command line seed process',
                email: ADMIN_EMAIL,
            },
            ipAddress: '127.0.0.1 (CLI)',
            userAgent: 'CLI Seed Runner',
            timestamp: new Date(),
        });
        console.log(`✅ Administrator account [${ADMIN_EMAIL}] successfully created/synchronized.`);
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('❌ Error during Admin seeding:', error);
        process.exit(1);
    }
};
exports.seedAdmin = seedAdmin;
if (require.main === module) {
    (0, exports.seedAdmin)().then(() => process.exit(0));
}
