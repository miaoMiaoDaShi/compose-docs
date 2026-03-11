# Modifier.Node 高性能自定义组件 🧩

## 概念

`Modifier.Node` 是 Compose 1.5+ 引入的高性能自定义修饰符方案。

## 代码示例

```kotlin
class HighPerfModifier(var scale: Float = 1f) : Modifier.Node() {
    override fun onMeasured(size: Size, layoutDirection: LayoutDirection, density: Density): MeasureResult {
        return layout(size.width.toInt(), size.height.toInt()) { }
    }
}
```

## 优势

- 更细粒度的重组控制
- 减少内存分配
- 适合高频更新场景（如动画）
