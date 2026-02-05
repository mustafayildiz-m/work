"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express = __importStar(require("express"));
async function bootstrap() {
    console.log('DB_HOST:', process.env.DB_HOST);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
        rawBody: true,
    });
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ limit: '100mb', extended: true }));
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://46.62.255.65:3000',
        'http://46.62.255.65:3001',
        'http://46.62.255.65:5173',
        'https://islamicwindows.com',
        'https://www.islamicwindows.com',
        'https://admin.islamicwindows.com',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    const uploadsPath = (0, path_1.join)(__dirname, '../..', 'uploads');
    app.use('/uploads', (req, res, next) => {
        const origin = req.headers.origin;
        if (!origin || allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin || '*');
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Credentials', 'true');
        }
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    app.use('/uploads', express.static(uploadsPath, {
        setHeaders: (res, path) => {
            res.set('Cache-Control', 'public, max-age=31536000');
            res.set('Last-Modified', new Date().toUTCString());
        },
    }));
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log('📁 Serving uploads from:', uploadsPath);
    console.log('📁 __dirname:', __dirname);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map