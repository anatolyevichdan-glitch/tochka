package identity

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
)

func NewTrackingNumber() (string, [32]byte, error) {
	var secret [32]byte
	if _, err := rand.Read(secret[:]); err != nil {
		return "", [32]byte{}, err
	}
	number := "OTK-" + strings.ToUpper(hex.EncodeToString(secret[:]))
	return number, sha256.Sum256(secret[:]), nil
}

func HashTrackingNumber(number string) ([32]byte, error) {
	number = strings.ToUpper(strings.TrimSpace(number))
	if !strings.HasPrefix(number, "OTK-") || len(number) != 68 {
		return [32]byte{}, errors.New("invalid tracking number")
	}
	secret, err := hex.DecodeString(number[4:])
	if err != nil {
		return [32]byte{}, errors.New("invalid tracking number")
	}
	return sha256.Sum256(secret), nil
}
