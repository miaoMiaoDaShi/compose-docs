# Compose 1.11 Breaking Changes 详解 🎯

> 摘要：Compose 1.11（含 1.11.0-beta02）引入多项 Breaking Changes，主要集中在 DrawLayer API 重命名、文本渲染行为变化和 SwipeToReveal 实现方式调整，提前了解有助于平滑迁移。
>
> 适用版本：Jetpack Compose 1.11.0-beta02+
>
> 更新时间：2026-03-31
>
> 标签：Breaking Changes，DrawLayer，Text，SwipeToReveal，迁移

## 核心变化一览

| 变化领域 | 旧 API | 新 API | 备注 |
|---------|--------|--------|------|
| DrawLayer | `outlineShape` | `shape`（默认 RectangleShape） | 参数名与语义调整 |
| DrawLayer | `clipToOutline` | `clip` | 参数名更简洁 |
| DrawLayer | `clipToBounds` | 已移除（由 `clip = true + RectangleShape` 替代） | 行为合并 |
| SwipeToReveal | Data class 方式 | Slot-based API | Compose 推荐方式 |
| Text | 首行/末行额外 padding | 移除额外 padding | 视觉布局有影响 |

---

## 1. DrawLayer API 调整

Compose 1.11 对 DrawLayer（即 `drawBehind` / `drawWithContent` 等场景中使用的图层修饰符）相关 API 做了整理：

### outlineShape → shape

```kotlin
// 旧写法（1.10 及之前）
Modifier.drawBehind {
    // ...
}.outlineShape(RoundedCornerShape(8.dp))

// 新写法（1.11+）
Modifier.drawBehind {
    // ...
}.shape(RoundedCornerShape(8.dp)) // 默认值 RectangleShape
```

> 注意：新 API `shape` 默认值为 `RectangleShape`，而非原来的继承行为。

### clipToOutline → clip

```kotlin
// 旧写法
Modifier
    .clipToOutline(true)
    .outlineShape(RoundedCornerShape(8.dp))

// 新写法
Modifier
    .clip(true)
    .shape(RoundedCornerShape(8.dp))
```

### clipToBounds 已移除

`clipToBounds` 的语义与 `clip = true + RectangleShape` 完全一致，因此被移除以减少冗余：

```kotlin
// 旧写法（1.10）
Modifier.clipToBounds(true)

// 新写法（1.11）
Modifier.clip(true) // 默认 shape 为 RectangleShape
```

---

## 2. 文本首行/末行 Padding 变化

这是对视觉效果影响最直接的变化。Compose 1.11 移除了文本组件首行顶部和末行底部的额外 padding。

**影响场景：**
- 紧凑型列表中的文本间距
- 卡片内文字与边框的距离
- 自定义设计系统中对文本高度的精确计算

**迁移建议：**
- 更新前先在 Debug 模式预览所有文本相关 UI
- 如需保留旧间距行为，可手动在 Text 外层加额外 padding

---

## 3. SwipeToReveal 改为 Slot-based API

Compose 1.11 中 `SwipeToReveal`（用于 Card、Chip 等组件的滑动揭示）从 Data class 方式改为 Compose 推荐 Slot API 方式。

```kotlin
// 旧写法（数据类方式）
SwipeToReveal(
    state = state,
    revealIcon = { /* ... */ },
    hiddenContent = { /* ... */ }
)

// 新写法（Slot-based，推荐）
SwipeToReveal(
    state = state,
    slots = arrayOf(
        revealIconSlot(
            icon = Icons.Default.Delete,
            onTriggered = { /* ... */ }
        )
    )
) {
    // 主内容
}
```

Slot API 更符合 Compose 的声明式理念，也更易于动态配置。

---

## 迁移检查清单

- [ ] 搜索项目中对 `outlineShape`、`clipToOutline`、`clipToBounds` 的使用并替换
- [ ] 审查所有 Text 组件的间距表现，尤其卡片和列表场景
- [ ] 检查 SwipeToReveal 的使用，更新为 Slot-based API
- [ ] 更新自定义设计系统中的 DrawLayer 配置
- [ ] 在多种屏幕尺寸上验证 Text 布局变化的影响

---

## Compose 1.11 当前版本状态（2026-03-25）

| 模块 | 稳定版 | Beta |
|------|--------|------|
| compose BOM | 1.10.6 | 1.11.0-beta02 |
| compose.material | 1.10.6 | 1.11.0-beta02 |
| compose.material3 | 1.4.0 | 1.5.0-alpha16 |
| compose.animation | 1.10.6 | 1.11.0-beta02 |
| compose.foundation | 1.10.6 | 1.11.0-beta02 |
| compose.runtime | 1.10.6 | 1.11.0-beta02 |
| compose.ui | 1.10.6 | 1.11.0-beta02 |

> 来源：[Android Developers Compose Release Notes](https://developer.android.com/jetpack/androidx/releases/compose)

---

## 4. LookaheadAnimationVisualDebugging 动画调试组件

> 适用于：Compose 1.11-alpha03+ / `androidx.compose.animation:animation`

Compose 1.11 新增了 `LookaheadAnimationVisualDebugging` 可组合函数，大幅简化动画调试过程。这是一个实验性 API，专门用于可视化 `LookaheadScope`（预测性动画框架）的内部工作原理。

**功能说明：**

`LookaheadAnimationVisualDebugging` 会以可视化方式展示以下信息：

| 显示内容 | 说明 |
|---------|------|
| **Approach Pass 边界** | 显示动画"接近目标"阶段的布局范围 |
| **Layout Pass 范围** | 显示最终布局计算的范围 |
| **Animation Target** | 动画目标状态的位置和尺寸 |
| **Offset/DpDelta** | 当前帧与目标帧之间的偏移量 |

**使用方式：**

```kotlin
import androidx.compose.animation.core.ExperimentalLookaheadAnimationVisualDebugApi

@OptIn(ExperimentalLookaheadAnimationVisualDebugApi::class)
@Composable
fun AnimatedListScreen() {
    LookaheadAnimationVisualDebugging {
        LazyColumn {
            items(list, key = { it.id }) { item ->
                AnimatedItem(item)
            }
        }
    }
}
```

**调试工作原理：**

```
初始状态 ──(Approach Pass)──> 预测目标位置 ──(Layout Pass)──> 最终渲染
         ↑ 显示偏移量可视化              ↑ 显示目标边界
```

在动画开发阶段开启此组件，开发者可以直观看到 Compose 在预测动画（Lookahead）过程中如何计算中间态的尺寸和位置，从而判断是否有不必要的布局计算或视觉跳帧。

**适用场景：**
- 列表项的进入/退出动画
- `AnimatedVisibility` + `Veil Transitions` 的精确调优
- 任何使用 `LookaheadScope` 的复杂过渡动画
- 性能分析：观察预测计算是否引入了额外布局开销

---

## 5. Shared Context for ComposeView 新标志

> 适用于：Compose 1.11-alpha03+ / `androidx.compose.ui.platform`

Compose 1.11 为 `ComposeView` 引入了**共享上下文（Shared Context）**标志，用于优化 View 系统与 Compose 混合使用时的内存和性能。

**背景问题：**

在传统用法中，每个 `ComposeView` 实例都有自己独立的 Composition 上下文。当同一个 Activity/Fragment 中存在多个 `ComposeView` 时，每个都会维护独立的 Compose 运行时实例，增加内存开销。

**新标志 `setContentWithSharedContext`：**

```kotlin
// 旧写法：每个 ComposeView 独立上下文
composeView.setContent {
    MyComposable()
}

// 新写法：多个 ComposeView 共享同一个 Composition 上下文
composeView.setContentWithSharedContext {
    MyComposable()
}
```

**典型应用场景：**

| 场景 | 收益 |
|------|------|
| Fragment 中多个 ComposeView | 减少内存占用 |
| ViewPager2 + ComposeView | 跨页面共享重组状态 |
| RecyclerView item 中的 ComposeView | 减少列表内存峰值 |
| Activity 嵌套多个 ComposeView | 统一生命周期管理 |

**注意事项：**
- 所有共享同一个上下文的 `ComposeView` 必须有相同的父 `Activity`/`Fragment` 生命周期
- 当其中一个 `ComposeView` 所在视图树被销毁时，需注意 `ViewCompositionStrategy` 的配置
- 该 API 为实验性，需配合 `@OptIn(ExperimentalComposeUiApi::class)` 使用

---

## ⚠️ Modifier.onFirstVisible 计划弃用

> 此 API 计划在 **Compose 1.11** 正式弃用，请尽快评估迁移方案。

`Modifier.onFirstVisible` 在 Compose 1.8/1.9 中用于监听元素首次可见。Compose 1.10 起已不推荐使用，Compose 1.11 将正式弃用。

**迁移方案：**

```kotlin
// ❌ 旧写法（计划弃用）
Modifier.onFirstVisible { /* 处理首次可见 */ }

// ✅ 新写法 1：使用 onGloballyPositioned + isImmediatelyAvailable
Modifier.onGloballyPositioned { state ->
    if (state.isImmediatelyAvailable) {
        // 首次就可用时触发
    }
}

// ✅ 新写法 2：使用 Visibility Tracking API（Compose 1.8+）
val visibilityTracking = rememberVisibilityTracking()
Modifier.trackVisibility(visibilityTracking) {
    onVisibilityChanged = { visible ->
        if (visible) { /* 处理可见 */ }
    }
}
```

**弃用原因：**
- `onFirstVisible` 语义与 `onGloballyPositioned` 重叠
- Visibility Tracking API 提供了更精确和可组合的控制能力
- 统一 Modifier 语义，减少认知负担
