package server

import (
	"encoding/json"
	"net/http"
)

func decodeJSON(req *http.Request, target any) error {
	defer req.Body.Close()
	return json.NewDecoder(req.Body).Decode(target)
}
