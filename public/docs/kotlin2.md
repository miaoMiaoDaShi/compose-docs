# Kotlin 2.0 Strong Skipping & Pausable Composition 🚀

> 摘要：Kotlin 2.0 与新版 Compose 编译器引入了更激进的重组优化能力，适合放在性能体系中理解。
>
> 适用版本：Kotlin 2.0+ / Compose 对应编译器版本
>
> 更新时间：2026-03-13
>
> 标签：性能，Kotlin2，StrongSkipping，PausableComposition

## 核心概念

随着 Kotlin 2.0 和 Compose 编译器演进，Compose 在“哪些代码需要重组、哪些可以安全跳过”这件事上变得更智能。`Strong Skipping` 和 `Pausable Composition` 都是在让高频滚动和复杂 UI 更新更平滑。

## 关键 API / 机制

- `Strong Skipping`：更积极地跳过不会影响结果的重组。
- `Pausable Composition`：把较重的组合工作拆分到多帧处理。
- 稳定性推断：帮助 Compose 判断对象变化是否真正影响界面。

## 示例代码

```kotlin
@Composable
fun OptimizedList(items: List<Item>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            ItemCard(item = item)
        }
    }
}
```

## 常见误区

- 误以为升级 Kotlin 2.0 后所有性能问题都会自动消失。
- 把运行时优化当成替代良好状态建模和列表设计的万能方案。
- 只关注编译器优化，不检查列表项稳定性和数据层开销。

## 最佳实践

- 升级版本后继续观察真实滚动和交互场景，而不是只看理论收益。
- 配合稳定 `key`、合理状态读取范围和轻量列表项一起使用。
- 把这类能力视为“增强项”，不是放弃基础性能治理的理由。

## 关联主题

- [性能优化指南](./performance-guide.md)
- [LazyColumn / LazyRow](./lazy-list.md)
- [derivedStateOf 性能优化](./derived-state.md)
