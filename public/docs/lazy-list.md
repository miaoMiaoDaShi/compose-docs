# LazyColumn / LazyRow 📋

> 摘要：`LazyColumn` 和 `LazyRow` 是 Compose 中处理长列表与横向滚动内容的核心组件。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：列表，LazyColumn，LazyRow，性能

## 核心概念

与一次性渲染全部子节点的 `Column`、`Row` 不同，Lazy 布局只组合当前可见区域附近的内容，因此更适合承载长列表、图片流和卡片流等高数量项场景。

## 关键 API / 机制

- `LazyColumn`：垂直方向惰性列表。
- `LazyRow`：水平方向惰性列表。
- `items()` / `itemsIndexed()`：批量渲染列表数据。
- `key`：提供稳定身份，帮助 Compose 正确跟踪列表项。

## 示例代码

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

## 常见误区

- 在长列表场景继续使用普通 `Column`：很容易带来性能浪费。
- 不提供稳定 `key`：排序、插入和删除时可能出现错位重组。
- 在列表项里做过重计算：会导致滚动期间卡顿。

## 最佳实践

- 列表项存在插入、删除或重排时优先提供稳定 `key`。
- 把复杂计算提前到数据层或 `remember` 中完成。
- 结合 `LazyListState` 处理滚动监听、回顶按钮和懒加载触发。

## 关联主题

- [性能优化指南](./performance-guide.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [布局组件 Box / Row / Column](./box-row-column.md)
