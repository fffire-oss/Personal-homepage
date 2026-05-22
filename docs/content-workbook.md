# ZephyrLabs 内容工作簿

这个文档用来慢慢填充个人主页内容。先写真实、简短、可维护的信息，不需要一次写完整。

## 1. 首页一句话

主页上最重要的一句话应该说明你现在是谁、正在做什么、对什么感兴趣。

可选版本：

- `ZephyrLabs 是我的个人实验场，记录代码、游戏、滑雪和一些正在形成的想法。`
- `I build small tools, learn in public, and keep a personal trail of projects.`
- `Code, games, snowboarding, and notes from ongoing experiments.`

你的版本：

```text

```

## 2. 当前状态

保持轻量，不要写成简历。

当前可以放：

```text
最近在学习滑雪。
正在完善个人主页和一个本地璀璨宝石游戏桌。
```

你想展示的当前状态：

```text

```

## 3. 滑雪主题内容

这些内容可以逐步放到主页的 Time / Space 区块里。

### 学习阶段

选择或改写：

- 第一次接触
- 正在练基础转弯
- 练习控制速度
- 学习 carving
- 想去更多雪场

你的阶段：

```text

```

### 滑雪目标

```text

```

### 可以公开的雪场 / 城市

不要写隐私地点，只写你愿意公开的城市或雪场。

```text
- 
- 
- 
```

## 4. Time 模块

这里不一定要是真实统计，也可以是“最近注意力分布”。

建议四项以内：

```text
Learn:
Build:
Snowboard:
Explore:
```

你自己的版本：

```text
标签 1:
标签 2:
标签 3:
标签 4:
```

## 5. Space 模块

用于做类似 qzq.at 那种“去过哪里 / 生活轨迹”的可视化。

先填 3 个节点：

```text
Base:
Slope:
Next:
```

你自己的版本：

```text
节点 1:
节点 2:
节点 3:
```

## 6. 项目卡片

首页项目不要太多。每个项目只写三句话以内。

### Gem Table

一句话：

```text
一个本地多人璀璨宝石游戏桌，支持规则流程和回放。
```

后续可以补充：

```text
- 支持 2/3/4 人本地轮流操作
- 支持 BGA-style JSON 导入导出
- 支持 next/prev move 回放
```

### GitHub

```text

```

### DinoBoard

```text

```

## 7. AI 聊天人格

如果主页未来加 AI 聊天，先定义它应该像什么，而不是先接 API。

它应该帮助访客：

```text
- 介绍我的项目
- 回答这个网站有哪些内容
- 推荐从哪个项目开始看
- 收集访客留言
```

它不应该做：

```text
- 编造我的经历
- 暴露私人信息
- 代表我承诺合作或交易
- 直接显示后台数据
```

AI 助手开场白：

```text

```

## 8. 评论系统字段

未来做后台时，评论至少需要这些字段：

```text
id:
page:
author_name:
author_email_optional:
message:
status: pending | approved | hidden
created_at:
admin_note:
```

评论展示规则：

```text
- 默认 pending，不直接公开
- 后台 approve 后展示
- 邮箱不公开
- 支持隐藏和标记垃圾评论
```

## 9. 以后可以扩展的页面

```text
/snowboarding.html 滑雪板学习记录
/notes.html        短笔记
/projects.html     项目总览
/gem-table.html    游戏页
/admin             后台管理
```
