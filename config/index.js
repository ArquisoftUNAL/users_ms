require("dotenv").config();

const config = {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    MONGODB_URL: process.env.MONGODB_URL,
    LDAP_URL: process.env.LDAP_URL,
    APP_PORT: process.env.APP_PORT || 3000,
}

module.exports = config;