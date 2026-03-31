# Kotlin 2.x & Compose 性能优化 🚀

> 摘要：Kotlin 2.x（2.0 / 2.2 / 2.3）系列与对应版本的 Compose 编译器带来了一系列性能改进，从编译器层面的激进去重（Strong Skipping）到运行时的分帧组合（Pausable Composition），再到 Kotlin 2.3 对 Compose 堆栈追踪的增强支持，构成了一套完整的性能优化体系。
>
> 适用版本：Kotlin 2.0+ / Compose Compiler 1.5.4+
>
> 更新时间：2026-03-31
>
> 标签：性能，Kotlin2，StrongSkipping，PausableComposition，ComposeCompiler

## 核心概念

Kotlin 2.x 系列在 Compose 性能方面持续深耕，主要围绕三个方向：

1. **Strong Skipping Mode**：编译器更激进地判断"哪些重组可以跳过"
2. **Pausable Composition**：将重计算拆分到多帧，防止主线程卡顿
3. **Compose 堆栈追踪增强**：Kotlin 2.3 配合 Compose 编译器可输出更易读的报错堆栈

这三个能力分别作用在编译期和运行时，共同目标是让高频滚动和复杂 UI 更新更流畅。

## 关键 API / 机制

### Strong Skipping Mode

Compose 编译器判断一个可组合函数是否需要重新执行，取决于它的参数是否"稳定"（Stable）。Strong Skipping 在这个基础上更进一步——即使参数不完全稳定，只要能通过更宽松的相等性判断，编译器也允许跳过。

```kotlin
// kotlin 2.0+ / compose compiler 1.5.4+
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-P",
            "plugin:androidx.compose.compiler.plugins.kotlin:experimentalStrongSkippingMode=true"
        )
    }
}
```

从 Kotlin 2.2 起，K2 编译器默认启用 Strong Skipping，无需显式开启。

**稳定性的新判断规则**：

| 类型 | Strong Skipping 前 | Strong Skipping 后 |
|------|-------------------|-------------------|
| 基础类型（Int, String 等） | 稳定 | 稳定 |
| 列表 / 集合（每次创建新实例） | 不稳定 | **稳定**（需每次创建新实例） |
| 数据类（所有字段稳定） | 稳定 | 稳定 |
| 普通类（无 @Stable 注解） | 不稳定 | 不稳定 |

### Pausable Composition

将较重的组合（Composition）工作分散到多个帧执行，避免一次性大计算阻塞主线程。这对复杂布局的首次构建尤其有效。

```kotlin
@Composable
fun HeavyListScreen() {
    // Compose 运行时自动将大型列表的分帧工作拆分
    LazyColumn {
        items(1000) { index ->
            ComplexItem(index)
        }
    }
}
```

### Kotlin 2.3 Compose 堆栈追踪增强

Kotlin 2.3 配合新版 Compose 编译器，提供了更清晰的重组（Recomposition）堆栈追踪。当重组过程中出错时，堆栈信息不再只有混淆过的字节码位置，而是能直接定位到具体的 `@Composable` 函数和行号。

> 注意：增强堆栈追踪需要 Kotlin 2.3.0+，旧版本仅输出标准 JVM 堆栈。

### Kotlin 2.3 新语言特性（对 Compose 的影响）

Kotlin 2.3 引入了两个对 Compose 有间接帮助的语言特性：

- **Stable nested type aliases（稳定的嵌套类型别名）**：改善泛型推导，减少类型推断导致的额外重组
- **Data flow-based exhaustiveness checks（数据流穷尽检查）**：在 when 表达式中提供更严格的穷尽性检查，配合 sealed class 使用时，编译器可以更准确地判断哪些分支不需要重组

## 示例代码

### 配合 Strong Skipping 优化列表

```kotlin
// 每次 items 引用变化时，创建新的 List 实例
// Strong Skipping 模式下，Compose 能正确识别列表内容变化
@Composable
fun OptimizedList(items: List<Item>) {
    LazyColumn {
        items(
            items = items,
            key = { it.id }  // 稳定 key，进一步帮助跳过
        ) { item ->
            ItemCard(item = item)
        }
    }
}

// 不推荐：传入同一个 List 实例引用，即使内容变了也不触发更新
@Composable
fun BadExample(items: MutableList<Item>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            ItemCard(item = item)
        }
    }
}
```

### 检查函数是否被正确跳过

```kotlin
// 使用 Layout Inspector 或 Compose Compiler Metrics 验证
// 目标：同样输入参数时，函数不应重新执行
@Composable
fun StableCard(name: String, count: Int) {
    // 在 Strong Skipping 模式下，以下条件满足时会跳过重组：
    // - name 值未变
    // - count 值未变
    Card {
        Text("$name: $count")
    }
}
```

## Compose December 2025 Release 要点

2025 年 12 月的 Compose BOM 带来了多项改进：

- **性能提升**：部分场景性能已与 Android Views 持平（特别是滚动场景）
- **Retain API 正式化**：`retain` API 随 Compose 运行时正式引入，用于配置变更和临时 UI 销毁时的状态保留
- **增强堆栈追踪**：需要 Kotlin 2.3.0+ 支持，适用于 Compose 运行时错误调试

## 常见误区

- 误以为升级 Kotlin 2.x 后所有性能问题会自动消失——Strong Skipping 只能跳过"可以不跑"的代码，不能替代低效的布局设计
- 把 Stable 注解当作银弹——过度依赖注解而不优化数据结构
- 以为列表每次重建就能被跳过——Strong Skipping 要求的是**引用变化**，而不仅仅是内容变化
- 忽略运行时状态读取粒度——即使编译器优化了重组，频繁的状态读取仍会导致 UI 刷新

## 最佳实践

1. **升级 Kotlin 到 2.3+**，并使用对应版本的 Compose 编译器，以获得完整优化能力
2. **观察实际滚动帧率**，而不是只看理论收益——用 Android Studio Profiler 或 Compose Layout Inspector 验证
3. **配合稳定 key 使用**——`LazyColumn` 的 `key` 参数始终是推荐的优化手段
4. **列表数据尽量用不可变 data class**——每次更新创建新实例，而不是修改原集合
5. **分帧处理重计算**——如果确实有大量计算，考虑用 `PausableComposition` 思路手动分帧
6. **错误排查时开启增强堆栈**——Kotlin 2.3+ 可以在开发阶段获得更易读的重组错误堆栈

## 关联主题

- [性能优化指南](./performance-guide.md)
- [LazyColumn / LazyRow](./lazy-list.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [Modifier.Node 高性能自定义组件](./modifier-node.md)
- [Retain API 状态保留](./retain-api.md)
