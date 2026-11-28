package identity

import (
	"regexp"
	"testing"
)

func TestNewID(t *testing.T) {
	pattern := regexp.MustCompile("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
	seen := make(map[string]bool)
	for range 100 {
		id, err := NewID()
		if err != nil || !pattern.MatchString(id) || seen[id] {
			t.Fatalf("invalid or repeated UUID: %q, error: %v", id, err)
		}
		seen[id] = true
	}
}
