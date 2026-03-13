# Canvas 绘图与自定义图形 ✏️

> 摘要：`Canvas` 适合需要自定义图形、图表或特殊视觉表达的 Compose 场景。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：Canvas，绘图，自定义图形，图表

## 核心概念

当标准组件无法满足视觉需求时，可以使用 `Canvas` 直接在绘制阶段绘制线条、矩形、圆形和路径。它更接近底层渲染能力，适合图表、进度指示器和个性化视觉效果。

## 关键 API / 机制

- `Canvas`：绘制容器。
- `size`：获取当前绘制区域尺寸。
- `drawLine()`、`drawRect()`、`drawCircle()`、`drawArc()`：常见绘图方法。
- 绘制阶段：区别于组合和布局，更关注像素输出。

## 示例代码

```kotlin
@Composable
fun MyCanvas() {
    Canvas(modifier = Modifier.size(200.dp)) {
        val canvasWidth = size.width
        val canvasHeight = size.height
    }
}
```

## 常见误区

- 为简单装饰也直接使用 Canvas，导致维护成本变高。
- 只关注绘制效果，忽略尺寸、密度和重绘频率。
- 把复杂图形逻辑全部堆在一个绘制块里，难以复用。

## 最佳实践

- 只有在标准组件不足以表达需求时再使用 Canvas。
- 对图表、进度条和特殊形状优先进行封装复用。
- 同时关注绘制性能和不同密度下的视觉一致性。

## 关联主题

- [富文本与 AnnotatedString](./rich-text.md)
- [Lazy Grid 网格布局](./lazy-grid.md)
- [Compose 动画 API 进阶](./animation.md)
- [Modifier 修饰符](./modifier.md)
