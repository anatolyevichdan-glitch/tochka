package main

import (
	"net/http/httptest"
	"testing"
)

func TestLiveness(t *testing.T) {
	for _, method := range []string{"GET", "POST"} {
		reply := httptest.NewRecorder()
		routes().ServeHTTP(reply, httptest.NewRequest(method, "/api/livez", nil))
		if method == "GET" && reply.Header().Get("Cache-Control") != "no-store" {
			t.Fatal("liveness response must not be cached")
		}
		if method == "POST" && reply.Code != 405 {
			t.Fatalf("POST status = %d", reply.Code)
		}
		if method == "GET" && (reply.Code != 200 || reply.Body.String() != "{\"status\":\"ok\"}\n") {
			t.Fatalf("GET response = %d %q", reply.Code, reply.Body.String())
		}
	}
}
