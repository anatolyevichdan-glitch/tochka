package identity

import (
	"strings"
	"testing"
)

func TestTrackingNumber(t *testing.T) {
	number, expected, err := NewTrackingNumber()
	if err != nil {
		t.Fatal(err)
	}
	actual, err := HashTrackingNumber("  " + strings.ToLower(number) + "  ")
	if err != nil || actual != expected {
		t.Fatal("generated number cannot be used for lookup")
	}
	second, hash, err := NewTrackingNumber()
	if err != nil || second == number || hash == expected {
		t.Fatal("independent tracking numbers must differ")
	}
	for _, invalid := range []string{"", "OTK-DEMO-0001", number[:67], number + "0", "BAD-" + number[4:], "OTK-" + strings.Repeat("Z", 64)} {
		if _, err := HashTrackingNumber(invalid); err == nil {
			t.Fatalf("accepted invalid tracking number %q", invalid)
		}
	}
}
