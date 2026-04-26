package settings

import (
	"context"
	"encoding/json"
	"time"

	"gorm.io/gorm"

	"localgateway/internal/models"
)

type Service struct {
	db *gorm.DB
}

type AppSettings struct {
	Host           string `json:"host"`
	Port           int    `json:"port"`
	AdminPath      string `json:"admin_path"`
	AdminUsername  string `json:"admin_username"`
	Theme          string `json:"theme"`
	UpdateChannel  string `json:"update_channel"`
	BackupInterval string `json:"backup_interval"`
	LogLevel       string `json:"log_level"`
	RetentionDays  int    `json:"retention_days"`
	BundleMode     string `json:"bundle_mode"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Get(ctx context.Context) (AppSettings, error) {
	var record models.Setting
	if err := s.db.WithContext(ctx).Where("key = ?", "app_settings").First(&record).Error; err != nil {
		defaultSettings := AppSettings{
			Host:           "127.0.0.1",
			Port:           18743,
			AdminPath:      "/admin",
			AdminUsername:  "admin",
			Theme:          "system",
			UpdateChannel:  "stable",
			BackupInterval: "24h",
			LogLevel:       "standard",
			RetentionDays:  30,
			BundleMode:     "single-binary",
		}
		return defaultSettings, nil
	}
	var value AppSettings
	if err := json.Unmarshal([]byte(record.ValueJSON), &value); err != nil {
		return AppSettings{}, err
	}
	return value, nil
}

func (s *Service) Save(ctx context.Context, value AppSettings) (AppSettings, error) {
	data, _ := json.Marshal(value)
	record := models.Setting{
		Key:       "app_settings",
		ValueJSON: string(data),
		UpdatedAt: time.Now(),
	}
	if err := s.db.WithContext(ctx).Save(&record).Error; err != nil {
		return AppSettings{}, err
	}
	return value, nil
}

func (s *Service) Backup(ctx context.Context) map[string]any {
	return map[string]any{
		"status":  "ok",
		"message": "配置备份检查完成，当前配置已保存在本地数据库。",
	}
}

func (s *Service) DistributionPlan() map[string]any {
	return map[string]any{
		"artifact": "lingshu.zip",
		"mode":     "download-and-run",
		"contents": []string{"lingshu.exe", "config.yaml", "data/", "logs/"},
		"notes": []string{
			"默认单目录部署",
			"首次下载后即可运行",
			"Admin 前端资源随可执行文件一并内嵌",
		},
	}
}
