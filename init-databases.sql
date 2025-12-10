-- Initialize all databases for microservices
-- This script runs when the PostgreSQL container starts for the first time

-- Create databases for each service
CREATE DATABASE users;
CREATE DATABASE queuing;
CREATE DATABASE interactions;
CREATE DATABASE history;
CREATE DATABASE communications;
CREATE DATABASE notifications;
CREATE DATABASE moderation;
CREATE DATABASE analytics;
CREATE DATABASE admin;
CREATE DATABASE subscriptions;

-- Grant privileges (optional, since we're using the postgres superuser)
GRANT ALL PRIVILEGES ON DATABASE users TO postgres;
GRANT ALL PRIVILEGES ON DATABASE queuing TO postgres;
GRANT ALL PRIVILEGES ON DATABASE interactions TO postgres;
GRANT ALL PRIVILEGES ON DATABASE history TO postgres;
GRANT ALL PRIVILEGES ON DATABASE communications TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notifications TO postgres;
GRANT ALL PRIVILEGES ON DATABASE moderation TO postgres;
GRANT ALL PRIVILEGES ON DATABASE analytics TO postgres;
GRANT ALL PRIVILEGES ON DATABASE admin TO postgres;
GRANT ALL PRIVILEGES ON DATABASE subscriptions TO postgres;
