# LifePoints

[![Latest Release](https://img.shields.io/github/v/release/XiaoyuZhuang/LifePoints?label=latest)](https://github.com/XiaoyuZhuang/LifePoints/releases/latest)
[![Android 7.0+](https://img.shields.io/badge/Android-7.0%2B-green)](https://github.com/XiaoyuZhuang/LifePoints/releases/latest)

> **把想做的事情变成积分，把想享受的事情变成奖励。**

**LifePoints** 是一个轻量、离线优先的个人积分与自我管理工具。

你可以为学习、工作、运动、阅读等事项设置积分，完成后立即获得反馈；也可以把游戏、影视、零食、购物等设为奖励，用已经积累的积分去兑换。

它没有复杂的任务系统，也不要求你建立一套庞大的计划。核心逻辑只有一件事：

**完成事情 → 获得积分 → 用积分兑换奖励。**

---

## 下载

### Android

[**下载最新版 LifePoints APK**](https://github.com/XiaoyuZhuang/LifePoints/releases/latest/download/LifePoints.apk)

也可以前往 [Releases](https://github.com/XiaoyuZhuang/LifePoints/releases) 查看最新版本和历史版本。

- 支持 Android 7.0 及以上版本
- 后续版本可以直接覆盖安装，无需卸载旧版本
- APP 内置 **Check for updates**，安装一次后可以直接在设置里检查新版本

> Android 首次安装 APK 时，系统可能会提示允许浏览器或文件管理器安装未知来源应用。这是 Android 的正常安全机制。

---

## 功能介绍

### Tasks

Tasks 是 LifePoints 的默认首页，也是最常使用的页面。

你可以创建反复使用的事项，例如：

- 学习 10 分钟
- 阅读 10 页
- 完成一项工作
- 运动 20 分钟
- 整理房间

每个 Task 都可以设置自己的积分。点击积分后，就会立即记入余额和 Timeline。

支持：

- 可重复使用的 Task
- 自定义名称和积分
- 点击名称直接编辑
- 自定义图标
- 自定义常用图标库
- 删除前二次确认
- 当前余额实时显示
- Total earned 累计积分显示

#### 倍率

LifePoints 支持倍率机制。

例如同样是“学习 10 分钟”：

- 普通状态：`1×`
- 明显不想学习时仍然主动开始：`2×`
- 特别困难的情况下完成：`3×`

倍率可以直接在 Task 行内切换，也可以在设置中自定义。

它的目的不是把事情变复杂，而是允许你根据当下的实际难度调整奖励反馈。

---

### Rewards

Rewards 用来消费已经获得的积分。

例如：

- 玩 10 分钟游戏
- 看一集剧
- 看一部电影
- 吃喜欢的零食
- 买一个想买的小东西

每个 Reward 都可以设置自己的积分消耗。

支持：

- 可重复使用的 Reward
- 自定义名称和积分
- 点击名称直接编辑
- 自定义图标
- 自定义奖励图标库
- 可选的消费前确认
- 删除前二次确认

LifePoints 不限制你娱乐，而是希望让“完成事情”和“享受奖励”之间形成更清楚的反馈关系。

---

### Timeline

Timeline 是 LifePoints 的积分流水账。

每次获得积分或消费积分，都会记录：

- 时间
- 项目名称
- 获得或消费的积分

页面顶部会显示：

- **Gained**：获得的积分
- **Spent**：消费的积分
- **Net**：净变化

#### 撤回误操作

如果不小心点错了一次 Task 或 Reward，可以直接在 Timeline 中撤回。

- 撤回获得积分：对应积分会从余额中扣回，Total earned 也会同步修正
- 撤回消费积分：对应积分会退回余额
- 对应 Timeline 记录同时删除

这样不需要再通过“随便消费一次”之类的方式手工把账调回来。

---

### Settings

LifePoints 提供了一些简单但实用的个性化选项：

- **Light** 浅色模式
- **Pure Black** 纯黑模式
- Small / Default / Large / XL 四档字号
- 自定义积分倍率
- 自定义 Task 图标库
- 自定义 Reward 图标库
- 消费前确认开关
- 跟随 Android 系统设置的触觉反馈
- JSON 数据导出
- 一键清空所有数据
- Support me
- Check for updates

---

## 软件内更新

进入：

**Settings → Check for updates**

LifePoints 会检查 GitHub Releases 中的最新版本。

如果有新版，可以直接下载安装，然后由 Android 系统完成覆盖更新。

Android 8.0 及以上版本第一次使用软件内更新时，系统可能要求为 LifePoints 开启“允许安装未知应用”。授权后，后续更新会方便很多。

---

## 数据与隐私

LifePoints 目前采用**离线优先**设计。

- 不需要注册账号
- 不需要登录
- 不需要云服务器
- 不包含广告
- Tasks、Rewards、Timeline、余额和设置均保存在本机
- 默认不会上传个人使用数据
- 可以手动导出 JSON 数据进行备份

即使没有网络，除检查更新和打开 GitHub 页面之外，主要功能仍然可以正常使用。

---

## 为什么做 LifePoints

很多事情的问题并不是“不知道应该做什么”，而是长期收益离得太远，短期反馈又太弱。

学习、运动、工作可能要很久以后才能看到结果，而游戏、视频、零食等娱乐往往马上就能获得反馈。

LifePoints 想做的事情很简单：

**人为给长期有价值的行为增加一个即时反馈。**

完成一件事情，马上得到积分；积累的积分，再去兑换自己真正想要的奖励。

它不是为了建立一个严格的奖惩制度，也不是为了让生活中的每件事都被量化。你可以只记录那些对自己有帮助的事情，也可以随时调整积分、倍率和奖励。

LifePoints 更像一个简单的个人反馈工具。

---

## Support me

如果 LifePoints 对你有帮助，可以通过 APP 中的 **Support me** 进入本项目 GitHub 页面。

支持完全自愿。

如果你发现 Bug、有功能建议，或者觉得某个交互还能更顺手，也欢迎通过 GitHub Issues 反馈。

<p align="center">
  <img height="420" src="https://github.com/user-attachments/assets/cd0eb38f-575f-4779-8fca-1355c7d1d0ed" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img height="420" src="https://github.com/user-attachments/assets/f1025770-c15a-413b-9e18-a3577ecc07aa" />
</p>

---

**Do something → Earn points → Spend points on something you enjoy.**
