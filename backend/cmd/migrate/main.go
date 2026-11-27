package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/anatolyevichdan-glitch/tochka/backend/internal/database"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	pool, err := database.Open(ctx, os.Getenv("OTK_DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err = database.Migrate(ctx, pool); err != nil {
		log.Fatal(err)
	}
	log.Print("Database migrations applied")
}
