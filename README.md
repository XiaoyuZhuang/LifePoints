# LifePoints

[![Latest Release](https://img.shields.io/github/v/release/XiaoyuZhuang/LifePoints?label=latest)](https://github.com/XiaoyuZhuang/LifePoints/releases/latest)
[![Android 7.0+](https://img.shields.io/badge/Android-7.0%2B-green)](https://github.com/XiaoyuZhuang/LifePoints/releases/latest)

> 把想做的事情变成积分，把想享受的事情变成奖励。

**LifePoints** 是一个轻量、离线优先的个人积分与自律工具。你可以为学习、工作、运动等重复事项设置积分，完成后即时获得积分；也可以把游戏、影视、零食、购物等设为奖励，用积分兑换。整个过程都记录在时间线里，方便回顾，也可以撤回误操作。

## 下载

**Android APK：**

[Download the latest LifePoints APK](https://github.com/XiaoyuZhuang/LifePoints/releases/latest/download/LifePoints.apk)

也可以进入 [Releases](https://github.com/XiaoyuZhuang/LifePoints/releases) 查看历史版本。

> Android 首次安装 APK 时可能需要允许浏览器或文件管理器安装未知来源应用。LifePoints 后续版本使用同一签名密钥，可以直接覆盖安装，无需卸载旧版本。

## 主要功能

### Tasks

Tasks 是默认首页，也是最高频使用的页面。

- 创建可重复使用的任务，任务不会因为完成一次而消失
- 点击积分即可记录一次完成并增加余额
- 同时显示当前余额与累计获得积分
- 支持自定义 `1× / 2× / 3×` 等倍率
- 倍率可直接在任务行内切换
- 点击任务名称即可修改名称、积分和图标
- 支持自定义常用图标库
- 删除任务前会二次确认

倍率适合处理“同样一件事，完成难度并不总是一样”的情况。例如平时学习 10 分钟记为 `1×`，在非常不想学习的时候主动开始，可以临时切换到更高倍率。

### Rewards

把娱乐和消费也变成清晰的积分支出。

- 创建可重复使用的奖励
- 点击积分即可兑换并扣除余额
- 可选择消费前是否确认
- 点击奖励名称即可编辑
- 支持自定义奖励图标
- 奖励会一直保留，直到手动删除

### Timeline

Timeline 是积分流水账。

- 记录每次获得和消费积分的时间
- 显示当前流水的 Gained、Spent 和 Net
- 每条流水都可以撤回
- 撤回获得积分：余额和 Total earned 会同步扣回
- 撤回消费积分：对应积分会退回余额
- 流水记录同时删除，避免误操作污染历史

### Settings

- Light / Pure Black 主题
- Small / Default / Large / XL 四档字号
- 自定义倍率
- 自定义 Task / Reward 图标库
- 支出确认开关
- 跟随 Android 系统强度的触觉反馈
- JSON 数据导出
- 一键清空所有积分数据
- Support me
- **Check for updates：从 GitHub Releases 检查、下载并覆盖安装最新版**

## 数据与隐私

LifePoints 目前不需要账号、服务器或云同步。

- Tasks、Rewards、Timeline、余额和偏好均保存在本机
- 默认不上传个人数据
- 不包含广告
- 可以手动导出 JSON 数据作为备份或迁移用途

## 软件内更新

Settings → **Check for updates** 会读取 GitHub 的 Latest Release：

1. 比较已安装版本与最新 Release
2. 有新版时询问是否更新
3. 下载官方 Release 中的 `LifePoints.apk`
4. 调起 Android 系统安装器进行覆盖安装

Android 8.0 及以上首次使用软件内更新时，系统可能要求为 LifePoints 开启“允许安装未知应用”。这是 Android 的系统安全机制，只需要按系统提示授权。

软件内更新依赖 GitHub 的公开 Release API，因此如果希望普通用户无需 GitHub 登录即可使用下载和检查更新，仓库需要保持 **Public**。

## 技术说明

- 平台：Android
- 最低版本：Android 7.0 / API 24
- 包名：`com.xiaoyuzhuang.lifepoints`
- UI：本地 WebView + HTML/CSS/JavaScript
- Android 原生层负责：
  - 状态栏与导航栏适配
  - 系统触觉反馈
  - 文件导出
  - GitHub Release 更新检查
  - APK 下载与系统安装
- 本地数据：WebView `localStorage`
- 无后端依赖，主界面离线可用

## 自动构建与发布

每次 push 到 `main` 后，GitHub Actions 会：

1. 编译 Debug 版本进行基本构建检查
2. 使用固定 release keystore 构建正式签名 APK
3. 上传 Actions Artifact
4. 自动创建 `v1.0.<run_number>` GitHub Release
5. 将 APK 以固定文件名 `LifePoints.apk` 上传到 Release

版本号和 Android `versionCode` 都跟随 GitHub Actions run number 递增，因此新版 APK 可以直接覆盖旧版。

### Release signing secrets

仓库需要配置以下 Actions Secrets：

- `LIFEPOINTS_KEYSTORE_BASE64`
- `LIFEPOINTS_KEYSTORE_PASSWORD`
- `LIFEPOINTS_KEY_PASSWORD`

Key alias 固定为 `lifepoints`。

**请永久保存 release keystore。** 如果签名密钥丢失，之后生成的 APK 将无法覆盖安装现有版本。

## Support

如果 LifePoints 对你有帮助，可以在 APP 的 **Support me** 中进入本项目 GitHub 页面。支持完全自愿；相关说明或二维码可以直接放在 GitHub 中，这样 APP 本身无需因为支持方式变化而频繁更新。

---

LifePoints 的核心逻辑很简单：

**Do something → Earn points → Spend points on something you enjoy.**
