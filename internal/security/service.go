package security

import "context"

type AuthStatus struct {
	Enabled           bool     `json:"enabled"`
	HasAdminPassword  bool     `json:"has_admin_password"`
	SessionMode       string   `json:"session_mode"`
	SecurityChecklist []string `json:"security_checklist"`
}

type LoginPayload struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Status(ctx context.Context) AuthStatus {
	_ = ctx
	return AuthStatus{
		Enabled:          true,
		HasAdminPassword: false,
		SessionMode:      "cookie-session",
		SecurityChecklist: []string{
			"首次启动必须设置管理员密码",
			"本地监听默认仅 127.0.0.1",
			"后续增加会话过期与登出能力",
		},
	}
}

func (s *Service) Login(ctx context.Context, payload LoginPayload) map[string]any {
	_ = ctx
	return map[string]any{
		"status":  "ok",
		"message": "登录入口占位执行成功，待真实运行时返回 session token。",
		"user":    payload.Username,
	}
}
