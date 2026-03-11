# LazyColumn / LazyRow 📋

## 概念

当需要显示大量数据时，使用 Column/Row 会导致性能问题。`LazyColumn`（垂直列表）和 `LazyRow`（水平列表）只渲染可见区域的元素，大幅提升性能。

## 代码示例

```kotlin
// 垂直列表
LazyColumn {
    items(itemsList) { item ->
        ListItem(title = item.name)
    }
}

// 水平列表
LazyRow {
    items(imagesList) { image ->
        Image(painter = image)
    }
}

// 带 key 的优化
LazyColumn {
    items(itemsList, key = { it.id }) { item ->
        ListItem(title = item.name)
    }
}
```

## 常用 API

| API | 说明 |
|-----|------|
| `items(list)` | 渲染列表 |
| `itemsIndexed(list)` | 带索引的渲染 |
| `item { }` | 单个元素 |
| `stickyHeader` | 粘性标题 |

## 关键点

- 只渲染可见区域内容，性能优异
- `items()` 用于渲染列表项
- 推荐指定 `key` 参数，帮助 Compose 精确跟踪元素
- `LazyListState` 可监听滚动位置
