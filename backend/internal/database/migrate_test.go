package database

import (
	"context"
	"crypto/rand"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestMigrations(t *testing.T) {
	url := os.Getenv("OTK_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("OTK_TEST_DATABASE_URL is required for database integration tests")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	pool, err := Open(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	schema := pgx.Identifier{"test_" + rand.Text()}.Sanitize()
	if _, err = pool.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	defer pool.Exec(context.Background(), "DROP SCHEMA "+schema+" CASCADE")
	config := pool.Config()
	config.ConnConfig.RuntimeParams["search_path"] = schema
	isolated, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatal(err)
	}
	defer isolated.Close()
	results := make(chan error, 2)
	for range 2 {
		go func() { results <- Migrate(ctx, isolated) }()
	}
	for range 2 {
		if err = <-results; err != nil {
			t.Fatal(err)
		}
	}
	if _, err = isolated.Exec(ctx, "UPDATE schema_migrations SET checksum = decode('00', 'hex')"); err != nil {
		t.Fatal(err)
	}
	if err = Migrate(ctx, isolated); err == nil {
		t.Fatal("changed migration checksum was accepted")
	}
}
