require("dotenv").config();

const config = {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_HOST: process.env.DATABASE_HOST || "localhost",
    APP_PORT: process.env.APP_PORT || 3000,
}

module.exports = config;