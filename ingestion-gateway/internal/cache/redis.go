package cache

import (
	"context"
	"os"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	client *redis.Client
	once   sync.Once
)

func GetRedisClient() *redis.Client {
	once.Do(func() {

		host := os.Getenv("REDIS_HOST")
		if host == "" {
			host = "localhost"
		}

		port := os.Getenv("REDIS_PORT")
		if port == "" {
			port = "6379"
		}

		addr := host + ":" + port

		client = redis.NewClient(&redis.Options{
			Addr:         addr,
			Password:     "",
			DB:           0,
			DialTimeout:  5 * time.Second,
			ReadTimeout:  3 * time.Second,
			WriteTimeout: 3 * time.Second,
		})

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := client.Ping(ctx).Err(); err != nil {
			panic("failed to connect to Redis: " + err.Error())
		}
	})

	return client
}