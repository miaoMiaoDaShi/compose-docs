# Kotlin 2.x & Compose 性能优化 🚀

> 摘要：Kotlin 2.x（2.0 / 2.2 / 2.3）系列与对应版本的 Compose 编译器带来了一系列性能改进，从编译器层面的激进去重（Strong Skipping）到运行时的分帧组合（Pausable Composition），再到 Kotlin 2.3 对 Compose 堆栈追踪的增强支持，构成了一套完整的性能优化体系。
>
> 适用版本：Kotlin 2.0+ / Compose Compiler 1.5.4+
>
> 更新时间：2026-04-07
>
> 标签：性能，Kotlin2，StrongSkipping，PausableComposition，ComposeCompiler，Kotlin2.3.20

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

### Pausable Composition（Kotlin 2.3.20+ 默认启用）

将较重的组合（Composition）工作分散到多个帧执行，避免一次性大计算阻塞主线程。这对复杂布局的首次构建尤其有效。

> **Kotlin 2.3.20（2026 年 3 月）重要更新**：`PausableComposition` 特性标志（Feature Flag）现已在 Kotlin 2.3.20 中 **默认启用**。在 Kotlin 2.2 及之前版本需要在 Gradle 中显式开启。

**Gradle 启用方式（Kotlin 2.2 及之前，现已默认，无需配置）：**

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-P",
            "plugin:androidx.compose.compiler.plugins.kotlin:experimentalPausableComposition=true"
        )
    }
}
```

**Kotlin 2.3.20+ 默认启用，无需额外配置：**

```kotlin
// kotlin 2.3.20+ / compose compiler 对应版本
// 无需任何编译器参数，运行时自动分帧处理大型组合任务
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

**工作原理（源码级）：**

```kotlin
// PausableComposition 内部实现简化逻辑
class PausableComposition {
    fun compose(composer: Composer) {
        while (!composer.isDone) {
            val deadline = chassis.frameDeadlineNs
            do {
                composer.composeNext()
            } while (!composer.isDone && system.nanoTime() < deadline)

            if (!composer.isDone) {
                // 暂停，下次帧信号触发时继续
                chassis.scheduleResumeAtNextFrame { compose(composer) }
                return
            }
        }
    }
}
```

**对 LazyColumn 的影响：**
- `LazyColumn` 的预取（prefetch）机制现在使用 `PausableComposition`
- 快速滚动时，新项的组合被分帧执行，主线程不会被长时间阻塞
- 滚动速度下降时，预取继续在后台"偷偷"完成，用户滚动到该位置时已经就绪

**注意事项：**
- `PausableComposition` 是内部 API，Compose 自动管理，无需手动调用
- 对大多数场景无感知，但对滚动帧率分析工具提出了新要求（分析时需考虑跨帧分布）
- 低端设备受益最明显：减少滚动卡顿，提升交互流畅度

### Kotlin 2.3.20 Compose 堆栈追踪增强

Kotlin 2.3 配合新版 Compose 编译器，提供了更清晰的重组（Recomposition）堆栈追踪。当重组过程中出错时，堆栈信息不再只有混淆过的字节码位置，而是能直接定位到具体的 `@Composable` 函数和行号。

> **注意**：增强堆栈追踪需要 Kotlin 2.3.0+，旧版本仅输出标准 JVM 堆栈。

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

## Stability Configuration File（Compose Compiler 1.5.5+）

> 适用于：Compose Compiler 1.5.5+ / Kotlin 2.0+

从 Compose Compiler 1.5.5 起，开发者可以提供一个**编译期配置文件**，在源代码没有 @Stable/@Immutable 注解的情况下，手动声明哪些类为"稳定"（Stable）。这解决了第三方库或遗留代码无法直接加注解时的性能优化问题。

**背景问题：**
- 第三方库的 data class 无法加 `@Stable` 注解
- 旧代码库迁移到 Compose 时，批量加注解工作量大
- Kotlin 集合（`List`、`Map`、`Set`）每次被当作不稳定处理，即使内容实际不可变

**配置方式：**

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-P",
            "plugin:androidx.compose.compiler.plugins.kotlin:stabilityConfigurationFile=<project_root>/config/stability-config.txt"
        )
    }
}
```

**配置文件示例（`config/stability-config.txt`）：**

```
# 格式：完全限定类名（或包名通配符）+ 稳定/非稳定标记

# 将整个包标记为稳定
com.example.data.model.*

# 特定类标记为稳定
com.example.domain.MySealedClass
com.example.ui.UiState

# 显式标记为不稳定（覆盖自动推断）
com.example.util.UnstableClass unstable
```

**包级通配符的好处：**
- 第三方库的所有 model 类一次性声明稳定
- 新增 model 不需要每次更新配置（除非显式标记不稳定）
- 与 KSP 注解处理器配合使用时，无需修改源代码

**与注解的区别：**

| 维度 | @Stable / @Immutable 注解 | Stability Configuration File |
|------|--------------------------|----------------------------|
| 位置 | 源代码（类定义处） | 编译配置文件 |
| 第三方库 | 不可用 | ✅ 可用 |
| 迁移成本 | 高（需改源码） | 低（仅改配置） |
| 细粒度 | 类级别 | 包/类级别 |
| 覆盖行为 | 无 | 可显式标记 `unstable` |

**验证工具：**
- Android Studio **Stability Analyzer**（Otter 3+ 内置）：实时高亮不稳定类
- Compose Compiler Metrics：`stability` 报告文件中查看每个类的稳定推断结果

**最佳实践：**
1. 先用 Stability Analyzer 定位真正影响性能的"不稳定传播链"
2. 对第三方库数据类优先使用配置文件，避免 fork 或反射
3. 用包级通配符批量处理，个别类显式标记 `unstable` 覆盖

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
