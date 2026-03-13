# Modifier.Node 高性能自定义组件 🧩

> 摘要：`Modifier.Node` 适合在复杂交互、动画和高频更新场景下构建更高性能的自定义修饰能力。
>
> 适用版本：Compose 1.5+，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：Modifier.Node，性能，自定义修饰符，底层机制

## 核心概念

相比早期以 `Modifier.Element` 为主的实现方式，`Modifier.Node` 提供了更接近底层的修饰符组织方式，适合需要更细粒度生命周期控制、较少对象分配和更高性能的场景。

## 关键 API / 机制

- `Modifier.Node`：承载修饰逻辑的核心节点。
- Node 生命周期：可在测量、放置、绘制、输入等阶段参与处理。
- 自定义修饰符扩展：把 Node 包装成更易复用的 API。

## 示例代码

```kotlin
class HighPerfModifier(var scale: Float = 1f) : Modifier.Node() {
    override fun onMeasured(size: Size, layoutDirection: LayoutDirection, density: Density): MeasureResult {
        return layout(size.width.toInt(), size.height.toInt()) { }
    }
}
```

## 常见误区

- 在普通样式定制场景也上 `Modifier.Node`：复杂度可能高于收益。
- 没有理解节点生命周期就直接上手，会让维护成本很高。
- 以为它能替代所有高层 Modifier API：多数常规需求仍用标准修饰符更合适。

## 最佳实践

- 把它留给高频更新、复杂输入和重性能场景。
- 先明确瓶颈，再决定是否从高层 API 下探到 Node。
- 对外仍然暴露清晰的扩展函数接口，隐藏底层复杂度。

## 关联主题

- [Modifier 修饰符](./modifier.md)
- [Compose 动画 API 进阶](./animation.md)
- [性能优化指南](./performance-guide.md)
