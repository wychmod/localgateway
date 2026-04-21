package bootstrap

import (
	"context"
)

type InitStatus struct {
	Configured        bool     `json:"configured"`
	AdminAccountReady bool     `json:"admin_account_ready"`
	DatabaseReady     bool     `json:"database_ready"`
	PortableReady     bool     `json:"portable_ready"`
	Steps             []string `json:"steps"`
	NextAction        string   `json:"next_action"`
}

type InitPayload struct {
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
	Host          string `json:"host"`
	Port          int    `json:"port"`
	Theme         string `json:"theme"`
}

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Status(ctx context.Context) InitStatus {
	_ = ctx
	return InitStatus{
		Configured:        false,
		AdminAccountReady: false,
		DatabaseReady:     true,
		PortableReady:     false,
		Steps: []string{
			"创建管理员账号",
			"确认本地监听地址",
			"完成主题与基础偏好初始化",
			"检查 portable 分发目录",
		},
		NextAction: "请先在初始化向导中完成管理员账号和基础设置。",
	}
}

func (s *Service) Run(ctx context.Context, payload InitPayload) map[string]any {
	_ = ctx
	return map[string]any{
		"status":  "ok",
		"message": "初始化向导占位执行成功，待真实运行时会写入配置、管理员密码和首次启动标记。",
		"payload": payload,
	}
}
