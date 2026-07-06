package config

import (
	"fmt"
	"os"
)

type Config struct {
	ServerPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

func Load() (*Config, error) {

	// -------------------------
	// Server Configuration
	// -------------------------
	port := os.Getenv("SERVER_PORT")

	if port == "" {
		port = "50051"
	}

	// -------------------------
	// Database Configuration
	// -------------------------
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	if dbHost == "" {
		dbHost = "localhost"
	}

	if dbPort == "" {
		dbPort = "5432"
	}

	if dbUser == "" {
		dbUser = "fintech_user"
	}

	if dbPassword == "" {
		dbPassword = "fintech_password"
	}

	if dbName == "" {
		dbName = "fintech_db"
	}

	cfg := &Config{
		ServerPort: port,

		DBHost:     dbHost,
		DBPort:     dbPort,
		DBUser:     dbUser,
		DBPassword: dbPassword,
		DBName:     dbName,
	}

	if cfg.ServerPort == "" {
		return nil, fmt.Errorf("server port cannot be empty")
	}

	return cfg, nil
}