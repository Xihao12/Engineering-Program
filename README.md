# CogniLink - 智能书签和知识管理系统

CogniLink 是一个功能强大的客户端书签和知识管理系统，完全运行在浏览器中，使用 IndexedDB 进行数据存储。

## 功能特性

- 📚 **智能书签管理** - 添加、编辑、删除和组织书签
- 🔍 **全文搜索** - 自定义倒排索引实现快速全文搜索
- 🏷️ **标签系统** - 使用标签对书签进行分类和组织
- 📁 **分类管理** - 创建和管理书签分类
- ⭐ **收藏功能** - 标记和筛选收藏的书签
- 📦 **归档功能** - 归档不需要的书签
- 💾 **客户端存储** - 所有数据存储在浏览器 IndexedDB 中
- 🎨 **现代化UI** - 美观且响应式的用户界面

## Tech Stack

- **React 18+** - 用于构建用户界面
- **TypeScript** - 提供类型安全
- **IndexedDB** - 客户端数据持久化
- **Vite** - 构建工具和开发服务器
- **自定义搜索索引** - 倒排索引实现全文搜索

## 项目结构

```
CogniLink/
├── src/
│   ├── components/      # React suites
│   │   ├── bookmarks/   # 书签相关组件
│   │   ├── categories/  # 分类相关组件
│   │   ├── tags/        # 标签相关组件
│   │   ├── search/      # 搜索相关组件
│   │   ├── filters/     # 筛选相关组件
│   │   ├── layout/      # 布局组件
│   │   └── ui/          # UI 基础组件
│   ├── contexts/        # React Context
│   ├── db/              # IndexedDB 数据库管理
│   ├── services/        # 业务逻辑服务
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 应用入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 核心功能实现

### 1. IndexedDB 数据管理

- 数据库架构设计
- 异步事务处理
- 数据迁移支持
- 数据导入导出

### 2. 自定义搜索索引

- 倒排索引实现
- 中英文分词
- TF-IDF 评分算法
- 多字段搜索

### 3. React 组件架构

- 25+ 功能组件
- Context API 状态管理
- 自定义 Hooks
- 响应式设计

## 数据模型

### Bookmark (书签)

```typescript
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  categoryId?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  archived: boolean;
}
```

### Category (分类)

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Tag (标签)

```typescript
interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
  usageCount: number;
}
```

## 使用说明

### 添加书签

1. 点击右上角"添加书签"按钮
2. 填写书签信息（标题、URL 为必填项）
3. 可选：添加描述、备注、分类和标签
4. 点击"添加"保存

### 搜索书签

1. 在顶部搜索栏输入关键词
2. 系统会自动搜索标题、描述、备注、URL 和标签
3. 搜索结果按相关性排序

### 管理分类

1. 在侧边栏点击"分类"标签
2. 点击"添加分类"创建新分类
3. 点击分类名称筛选该分类下的书签

### 使用标签

1. 在添加/编辑书签时输入标签
2. 在侧边栏点击"标签"查看所有标签
3. 点击标签筛选包含该标签的书签

### 收藏和归档

- 点击书签卡片上的星标收藏书签
- 在书签详情页面可以归档书签
- 使用筛选面板快速查看收藏或归档的书签

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

## Develop Plans

- [ ] 数据导入/导出功能
- [ ] 书签批量操作
- [ ] 更高级的搜索选项
- [ ] 主题切换
- [ ] 键盘快捷键
- [ ] 书签分享功能

## License

MIT License

## Author

Xihao Yang

CogniLink 项目

---

**注意**: 这是一个纯客户端应用，所有数据都存储在浏览器的 IndexedDB 中。清除浏览器数据将导致所有书签丢失，请定期导出数据备份。




