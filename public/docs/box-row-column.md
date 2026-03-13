# 布局组件 Box / Row / Column 📦

> 摘要：`Box`、`Row`、`Column` 是 Compose 中最基础也最常用的三种布局容器。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：布局，Box，Row，Column，基础

## 核心概念

这三个布局组件分别对应叠放、水平排列和垂直排列，是 Compose 页面结构的基础骨架。理解它们的排列方向、对子元素的约束方式以及对齐参数，是后续使用 Lazy 布局和自定义布局的前提。

## 关键 API / 机制

- `Box`：用于层叠布局或在同一区域放置多个元素。
- `Row`：沿水平方向排列子元素。
- `Column`：沿垂直方向排列子元素。
- `horizontalAlignment`、`verticalAlignment`、`Arrangement`：决定子元素在主轴和交叉轴上的摆放方式。

## 示例代码

```kotlin
// Column: 垂直排列
Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally
) {
    Text("第一行")
    Text("第二行")
}

// Row: 水平排列
Row(
    modifier = Modifier.fillMaxWidth(),
    verticalAlignment = Alignment.CenterVertically
) {
    Text("左边")
    Text("右边")
}

// Box: 叠加布局
Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
) {
    Text("居中")
}
```

## 常见误区

- 把 `Box` 当作万能布局容器：复杂列表和滚动场景更适合 Lazy 布局。
- 忽略对齐参数的维度：`Row` 和 `Column` 的主轴、交叉轴参数含义不同。
- 用大量嵌套基础布局堆页面：会降低结构清晰度，后期难维护。

## 最佳实践

- 简单静态结构优先使用 `Box`、`Row`、`Column`。
- 布局层级尽量扁平，减少无意义嵌套。
- 结合 `Modifier.padding()`、`weight()` 和对齐参数组织页面节奏。

## 关联主题

- [Modifier 修饰符](./modifier.md)
- [LazyColumn / LazyRow](./lazy-list.md)
- [Material 3 自适应布局](./material3.md)
