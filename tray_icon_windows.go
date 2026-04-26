//go:build windows

package main

import _ "embed"

//go:embed cmd/localgateway/tray-icon.ico
var trayIcon []byte
