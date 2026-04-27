-- VERTEXPRIME Platform Database Schema
-- MariaDB/MySQL compatible

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    accountType ENUM('individual', 'corporate', 'partnership') DEFAULT 'individual',
    role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
    dateOfBirth DATE,
    emailVerified BOOLEAN DEFAULT FALSE,
    upgradeLevel ENUM('free', 'mini', 'standard', 'pro', 'premium') DEFAULT 'free',
    darkMode BOOLEAN DEFAULT FALSE,
    notifications BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    settingsUpdatedAt DATETIME NULL,
    verificationApprovedAt DATETIME NULL,
    balanceUsd DECIMAL(15,2) DEFAULT 0.00,
    roi DECIMAL(15,2) DEFAULT 0.00,
    banned BOOLEAN DEFAULT false,
    frozen BOOLEAN DEFAULT false,
    bankAccountHolder VARCHAR(255),
    bankName VARCHAR(255),
    bankAccountNumber VARCHAR(255),
    bankRoutingNumber VARCHAR(255),
    bitcoinAddress VARCHAR(255),
    ethereumAddress VARCHAR(255),
    withdrawal_min_usd DECIMAL(15,2) DEFAULT 500.00,
    withdrawal_max_usd DECIMAL(15,2) DEFAULT 5000.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE portfolios (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deposits (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    paymentMethod ENUM('bank', 'card', 'crypto', 'wallet') NOT NULL DEFAULT 'crypto',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedAt DATETIME NULL,
    adminNotes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    withdrawalMethod VARCHAR(50) NOT NULL,
    destinationAddress VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedAt DATETIME NULL,
    processedAt DATETIME NULL,
    adminNotes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trades (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    asset VARCHAR(50) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    leverage INT DEFAULT 1,
    status ENUM('active', 'closed', 'reported') NOT NULL DEFAULT 'active',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    closedAt DATETIME NULL,
    result ENUM('gain', 'loss') NULL,
    resultAmount DECIMAL(15,2) DEFAULT 0,
    adminNotes TEXT,
    INDEX idx_trade_userId (userId),
    CONSTRAINT fk_trades_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE verifications (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    documentType VARCHAR(50) NOT NULL,
    documentNumber VARCHAR(255) NOT NULL,
    expiryDate DATE NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedAt DATETIME NULL,
    adminNotes TEXT,
    INDEX idx_verif_userId (userId),
    CONSTRAINT fk_verifications_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE upgrade_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    priceMonthly DECIMAL(15,2) DEFAULT 0,
    priceAnnual DECIMAL(15,2) DEFAULT 0,
    features TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE upgrades (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    upgradeLevel ENUM('free', 'mini', 'standard', 'pro', 'premium') DEFAULT 'free',
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedAt DATETIME NULL,
    adminNotes TEXT,
    INDEX idx_upgrade_userId (userId),
    CONSTRAINT fk_upgrades_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    type ENUM('trade', 'deposit', 'withdrawal') NOT NULL,
    referenceId VARCHAR(50),
    amount DECIMAL(18, 6) NOT NULL,
    status ENUM('completed', 'pending', 'failed') DEFAULT 'pending',
    method VARCHAR(30),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    processedAt DATETIME DEFAULT NULL,
    notes TEXT,
    INDEX idx_transactions_user (userId),
    CONSTRAINT fk_transactions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    senderId VARCHAR(36) NOT NULL,
    recipientId VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deposit_settings (
    id INT PRIMARY KEY DEFAULT 1,
    bank_account_number VARCHAR(255),
    bank_account_holder VARCHAR(255),
    bank_routing_number VARCHAR(255),
    bank_name VARCHAR(255),
    crypto_address VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default deposit settings
INSERT INTO deposit_settings (id, bank_account_number, bank_account_holder, bank_routing_number, bank_name, crypto_address) 
VALUES (1, '1234567890', 'CFD Financial Bank', '121000248', 'CFD Financial Bank', 'THQYgNzTYo7g5aBhhJLMc2FaA632FwZ4WK');

CREATE TABLE support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE broadcasts (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('upgrade', 'maintenance', 'info') DEFAULT 'info',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallets (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    balance DECIMAL(18,2) DEFAULT 0,
    balance_usd DECIMAL(18,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== SAMPLE DATA ==========

-- Admin User
INSERT INTO users (id, firstName, lastName, username, email, password, country, currency, accountType, role, emailVerified, balanceUsd, roi)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'User', 'admin_cfd', 'cfdtradingpro@gmail.com', 'CFDTrading@101', 'USA', 'USD', 'individual', 'admin', TRUE, 5000.00, 0.00);

-- Upgrade Plans
INSERT INTO upgrade_plans (id, name, description, priceMonthly, priceAnnual, features) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'mini', 'Mini Plan - Entry Level Trading', 49.99, 499.90, 'Up to $5,000 trading limit,Basic market data,Email support'),
('660e8400-e29b-41d4-a716-446655440002', 'standard', 'Standard Plan - Regular Traders', 299.99, 2999.90, 'Up to $50,000 trading limit,Advanced market data,Priority support,API access'),
('660e8400-e29b-41d4-a716-446655440003', 'pro', 'Pro Plan - Professional Traders', 799.99, 7999.90, 'Up to $500,000 trading limit,Real-time data,24/7 support,Unlimited trades,Dedicated manager'),
('660e8400-e29b-41d4-a716-446655440004', 'premium', 'Premium Plan - Institutional', 1999.99, 19999.90, 'Unlimited trading limit,Premium data feeds,24/7 dedicated support,Custom integrations');