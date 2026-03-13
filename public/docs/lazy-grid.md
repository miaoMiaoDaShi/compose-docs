# Lazy Grid 网格布局 🧱

> 摘要：`LazyVerticalGrid` 和相关网格 API 适合图片墙、卡片流和多列内容展示场景。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：LazyGrid，网格布局，滚动，列表

## 核心概念

当内容不再适合单列或单行排列时，Lazy Grid 可以在保持惰性加载的前提下，将元素组织成多列网格。它特别适合图片瀑布流、商品卡片区和图库类界面。

## 关键 API / 机制

- `LazyVerticalGrid`：垂直滚动的网格容器。
- `GridCells.Adaptive`：根据最小宽度自动计算列数。
- `GridCells.Fixed`：固定列数的网格布局。
- `contentPadding`：控制网格整体边距。

## 示例代码

```kotlin
LazyVerticalGrid(
    columns = GridCells.Adaptive(minSize = 128.dp),
    contentPadding = PaddingValues(16.dp)
) {
    items(items) { item ->
        GridItem(item)
    }
}
```

## 常见误区

- 内容很多时仍然用 `Row` 或 `Column` 手动换行。
- 只关注列数，不处理不同屏幕宽度下的适配。
- 列表项尺寸和比例变化很大，却没有提前设计视觉节奏。

## 最佳实践

- 响应式场景优先使用 `GridCells.Adaptive`。
- 网格项较复杂时控制单项渲染成本，避免滚动卡顿。
- 把网格布局看作 Lazy 列表的一个变体，继续遵守稳定 key 和轻量项原则。

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md)
- [Material 3 自适应布局](./material3.md)
- [富文本与 AnnotatedString](./rich-text.md)
