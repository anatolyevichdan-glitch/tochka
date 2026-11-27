package database

import (
	"bytes"
	"context"
	"crypto/sha256"
	"embed"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrations embed.FS

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(context.Background())
	if _, err = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(71586321)"); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		name text PRIMARY KEY, checksum bytea NOT NULL,
		applied_at timestamptz NOT NULL DEFAULT now())`); err != nil {
		return err
	}
	entries, err := migrations.ReadDir("migrations")
	if err != nil {
		return err
	}
	for _, entry := range entries {
		name := entry.Name()
		script, err := migrations.ReadFile("migrations/" + name)
		if err != nil {
			return err
		}
		script = bytes.ReplaceAll(script, []byte("\r\n"), []byte("\n"))
		checksum := sha256.Sum256(script)
		var previous []byte
		err = tx.QueryRow(ctx, "SELECT checksum FROM schema_migrations WHERE name = $1", name).Scan(&previous)
		if err == nil {
			if !bytes.Equal(previous, checksum[:]) {
				return fmt.Errorf("migration %s changed after application", name)
			}
			continue
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return err
		}
		if _, err = tx.Exec(ctx, string(script)); err != nil {
			return fmt.Errorf("apply %s: %w", name, err)
		}
		if _, err = tx.Exec(ctx, "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", name, checksum[:]); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}
