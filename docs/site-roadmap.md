# ZephyrLabs 网站路线图

这个路线图的目标是让个人主页慢慢变成“有内容、有交互、有后台”的个人产品，而不是一次性堆功能。

## 当前状态

现在仓库是纯静态站点：

```text
index.html
styles.css
shared/effects.js
homepage-effects.js
gemtable/
  index.html
  styles.css
  app.js
  modules/rules.js
```

优点：

- 部署简单
- 不需要构建
- 不需要服务器
- 页面很容易维护

限制：

- 没有真正的登录
- 没有数据库
- 不能安全地在前端直接调用 AI API
- 评论和后台管理需要后端服务

## 推荐演进顺序

### Phase 1: 先把内容填真实

先不要急着做后台。把 `docs/content-workbook.md` 填起来，然后再把稳定内容同步到首页。

优先填：

```text
1. 首页一句话
2. 当前状态
3. Time 模块
4. Space 模块
5. 项目卡片文案
6. AI 聊天人格
```

这一阶段仍然保持纯静态。

### Phase 2: 把内容抽成数据

当内容变多后，不要继续手写很多 HTML。可以增加：

```text
content/profile.json
content/projects.json
content/timeline.json
content/places.json
```

前端读取这些 JSON 渲染首页。这样你以后只改内容文件，不改页面结构。

### Phase 3: 加 AI 聊天

不要把 AI API key 放在浏览器里。正确结构是：

```text
Browser chat UI
  -> /api/chat
    -> AI provider
```

AI 聊天应该先做成“个人主页导览助手”，而不是通用聊天机器人。

它可以回答：

```text
这个人做了什么项目？
Gem Table 是什么？
滑雪学习记录在哪里？
有哪些可以看的文章？
怎么留言？
```

它应该基于你自己维护的内容数据回答，例如：

```text
content/profile.json
content/projects.json
content/notes/*.md
```

建议第一版功能：

```text
- 固定右下角聊天按钮
- 只回答站内内容
- 回答里附带相关链接
- 不知道就说不知道
- 不保存敏感对话
```

### Phase 4: 评论系统

评论系统需要数据库和审核状态。推荐最小数据模型：

```text
comments
- id
- page
- author_name
- author_email_optional
- message
- status
- created_at
- admin_note
```

前端：

```text
访客提交评论 -> pending
页面只显示 approved 评论
```

后台：

```text
登录
查看 pending 评论
approve / hide / delete
添加 admin note
```

### Phase 5: 后台管理系统

后台不要一开始做得太大。第一版只做：

```text
/admin/login
/admin/comments
/admin/profile
```

后面再加：

```text
/admin/projects
/admin/places
/admin/notes
/admin/chat-logs
```

## 技术路线选择

### 方案 A: 继续静态站 + 外部后端

适合现在这个仓库。

```text
GitHub Pages / 静态部署
Supabase / Firebase / PocketBase 做数据库
Serverless Function 做 AI chat proxy
```

优点：

- 可以保留现在的静态页面
- 迁移成本低
- 评论和 AI 可以逐步加

缺点：

- 前端和后端分散
- 本地开发需要多配置

### 方案 B: 迁移到 Next.js

适合你想长期做成完整个人产品。

```text
Next.js App Router
API routes / server actions
数据库
后台页面
AI chat endpoint
```

优点：

- 页面、API、后台放在一个项目里
- 更适合 AI chat 和 admin
- 以后做博客、登录、评论更自然

缺点：

- 需要构建和部署配置
- 需要从纯静态迁移

### 方案 C: Astro + 后端服务

适合内容型个人主页。

```text
Astro 做内容页面
少量交互组件
外部 serverless 做 AI 和评论
```

优点：

- 内容站体验好
- 页面性能强
- 适合 markdown 写作

缺点：

- 后台管理仍需要额外服务

## 我建议你的路线

现在先走：

```text
Phase 1 -> Phase 2 -> Phase 3
```

也就是：

```text
先填内容
再抽 JSON/Markdown
最后加 AI chat
```

后台评论系统建议等内容结构稳定后再做。否则你会同时维护页面、数据库、权限、审核、垃圾评论处理和 AI 安全策略，成本会比页面本身高很多。

## 后续实现任务拆分

如果要继续开发，可以按这个顺序开任务：

```text
1. 建立 content/*.json，让首页从内容文件渲染
2. 增加 /notes.html，支持静态笔记列表
3. 增加 AI chat 前端壳，但先使用本地 mock
4. 增加 /api/chat 后端代理
5. 增加 comments 表和评论提交接口
6. 增加 /admin/comments 审核后台
7. 增加后台登录和权限
```
