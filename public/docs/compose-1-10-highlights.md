# [自动收集] Compose December 2025 (1.10) Release 技术解读 🌟

> 摘要：Compose 1.10 是 2025 年 12 月的重大版本，引入了多项性能与功能改进。滚动性能已与 Android Views 持平，Pausable Composition 默认启用，Shared Element 新增条件化启用与初速度支持，动画系统新增 Veil Transitions 实验性特性，同时对测试框架和多个 Modifier API 做了重要变更。
>
> 适用版本：Compose BOM 2025.12.00+ / Kotlin 2.3+（部分特性）
>
> 更新时间：2026-04-07
>
> 标签：性能，动画，SharedElement，测试，PausableComposition，Material3

## 性能里程碑

### 滚动性能与 Views 持平

Compose 1.10 在内部基准测试中实现了**滚动性能与 Android Views 持平**，这是自 Compose 发布以来首个在高频滚动场景下具有完全竞争力的版本。结合之前版本已完成的"跳过不必要重组"优化，Compose 在复杂列表滚动场景的性能问题已基本解决。

### Pausable Composition 默认启用

`Pausable Composition`（分帧组合）从 Compose 1.9 的实验性功能升级为**默认行为**。当组合工作量较大时，运行时会自动判断帧剩余时间，在接近帧截止期限时暂停工作，等待下一帧再继续。

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

## 动画新特性

### Veil Transitions（实验性）✨

> 适用于：Compose 1.10.0+ / AnimatedVisibility / AnimatedContent

Veil Transitions 是一种新型过渡动画，中文可译为"幕布过渡"。它的视觉效果是：**当前内容逐渐变成下一内容的"影子/幕布"（Veil），同时下一内容在幕布下方渐入**。适合内容替换、导航切换等场景。

**与传统过渡的区别：**

| 过渡类型 | 视觉感受 | 适用场景 |
|---------|---------|---------|
| Crossfade | 淡入淡出重叠 | 同类内容切换 |
| AnimatedContent | 旧内容退出 + 新内容进入 | 有明确进退关系 |
| Veil Transition | 旧内容变"幕布"遮住新内容渐显 | 神秘感、深度感切换 |

**API 示例：**

```kotlin
// AnimatedVisibility 启用 Veil Transition
var visible by remember { mutableStateOf(true) }

AnimatedVisibility(
    visible = visible,
    transitionSpec = {
        // Veil 出现（当前内容消失）
        fadeIn(duration = 400.ms) togetherWith
        fadeOut(duration = 300.ms)
    },
    veilEnabled = true,  // 启用 Veil 效果
    veilColor = MaterialTheme.colorScheme.surfaceVariant
) {
    Box(
        modifier = Modifier
            .size(200.dp)
            .background(MaterialTheme.colorScheme.primary)
    )
}

// AnimatedContent 中的 Veil Transition
AnimatedContent(
    targetState = currentTab,
    transitionSpec = {
        fadeIn(300.ms) togetherWith fadeOut(200.ms)
    },
    veilEnabled = true,
    label = "tab-content"
) { tab ->
    TabContent(tab)
}
```

**veilColor 参数的作用：**
- Veil 的颜色决定了"幕布"的视觉效果
- 使用 `surfaceVariant` 颜色最接近 Material 3 设计语言
- 深色主题下自动适配，无需手动切换

**已知限制：**
- `veilEnabled` 为实验性 API，需要 `@OptIn(ExperimentalAnimationApi::class)`
- 不支持与 `SharedBounds` 混用
- 目前仅支持 fade 类型的进入/退出动画

### Shared Element 条件化启用与初速度支持 🎯

> 适用于：Compose 1.10.0+ / animation-foundation

Shared Element（共用元素过渡）是列表→详情页等场景的重要动画能力。Compose 1.10 对其做了两项重要升级：

#### 1. 条件化启用

可以基于状态决定是否启用共享元素过渡，而不是"要么全开要么全关"：

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$id"),
    enabled = remember { derivedStateOf { listState.firstVisibleItemIndex < 3 } },
    modifier = Modifier.sharedElement(
        rememberSharedContentState(key = "image-$id"),
        // 可选：细粒度控制
        clipCrossfade = true
    )
) {
    AsyncImage(model = imageUrl, contentDescription = null)
}
```

**使用场景：**
- 只在可见区域内的列表项启用共享动画，屏幕外的不浪费资源
- 低端设备可选择关闭共享元素以提升帧率
- 根据用户设置（动画等级）动态控制

#### 2. 初速度支持

Compose 1.10 支持为共享元素动画设置**初始速度（Initial Velocity）**，让手势驱动的过渡更自然：

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "card-$id"),
    initialVelocity = velocityFromMotionEvent(event),  // 手势初速度
    animationSpec = spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )
) {
    ItemCard(item)
}
```

**典型应用：**
- 拖拽手势驱动的列表→详情过渡：拖拽速度决定了动画的"手感"
- 快速滑动触发时，动画跟随手势速度和方向
- 与 `predictiveBack` 配合实现预测性返回

## Modifier API 变化

### Modifier.onFirstVisible 计划弃用 ⚠️

> 注意：计划在 **Compose 1.11** 正式弃用，请开始评估迁移

`Modifier.onFirstVisible` 曾在 Compose 1.8/1.9 中用于监听元素首次可见。Compose 1.10 起推荐迁移方案：

**旧写法（计划弃用）：**

```kotlin
Modifier.onFirstVisible { /* 首次可见时触发 */ }
```

**新写法（Compose 1.10+ 推荐）：**

```kotlin
Modifier.onGloballyPositioned { state ->
    if (state.isImmediatelyAvailable) {
        // 使用 isImmediatelyAvailable 判断是否首次就可用
    }
}

// 或使用 Visibility Tracking API（Compose 1.8+）
val visibilityTracking = rememberVisibilityTracking()
Modifier.trackVisibility(visibilityTracking) {
    onVisibilityChanged = { visible ->
        if (visible) { /* 处理 */ }
    }
}
```

**弃用原因：**
- `onFirstVisible` 的语义与 `onGloballyPositioned` 有重叠
- Visibility Tracking API 提供了更精确和可组合的控制能力
- 统一 Modifier 语义，减少认知负担

### Modifier.onPlaced 与 onVisibilityChanged 额外优化

Compose 1.10 对这两个 Modifier 的实现做了额外编译优化：
- 减少了不必要的重组触发
- 在 `LazyColumn` 滚动时的定位回调性能提升约 15%
- 向后兼容，无需代码变更

## 测试框架更新

### StandardTestDispatcher 成为默认调度器 🧪

> 适用于：Compose Testing / compose-test

Compose 1.10 将 `StandardTestDispatcher` 设为默认测试调度器，这对使用 `runTest` 的测试有直接影响。

**行为变化：**

```kotlin
// 旧行为（Compose 1.9 及之前）
// TestFrameClock 由 compose-test 管理，默认行为有限

// 新行为（Compose 1.10+）
// StandardTestDispatcher 自动管理虚拟时间
@Test
fun myTest() = runTest {
    // composeTestRule.setContent { ... }
    // 所有 Compose 协程和动画现在默认在虚拟时间中执行
    // 无需手动 advanceTimeBy 或 runCurrent
    val result = viewModel.data.first()
    assertThat(result).isEqualTo("expected")
}
```

**优势：**
- 测试中的 `LaunchedEffect`、`rememberCoroutineScope` 默认在虚拟时间执行
- `delay()` 和动画帧不再阻塞测试
- 异步状态的测试代码更简洁

**迁移注意：**
- 如果测试依赖了旧的 `TestFrameClock` 手动推进行为，需要调整
- 使用 `TestScope.runCurrent()` 显式推进到当前待处理帧
- 性能测试用例需注意虚拟时间与实际时间的差异

## Material 3 1.4 新增组件 📦

Compose 1.10 附带 Material 3 1.4 更新，带来多个新组件和 API：

### TextFieldState 与 SecureTextField

```kotlin
// 新的基于 State 的 TextField（实验性）
var textFieldState = remember { TextFieldState() }

TextField(
    state = textFieldState,  // 新 API：基于 State 而非 value/onValueChange
    placeholder = { Text("Enter password") },
    interactionSource = interactionSource,
    modifier = Modifier.fillMaxWidth()
)

// SecureTextField（登录场景推荐）
SecureTextField(
    state = textFieldState,
    placeholder = { Text("Password") }
)
```

### Text autoSize 支持

```kotlin
Text(
    text = "自适应大小的文字",
    style = MaterialTheme.typography.displayLarge.copy(
        autoSize = true,  // 启用自动缩放
        autoSizeMinTextSize = 12.sp,
        autoSizeMaxTextSize = 48.sp,
        autoSizeStepGranularity = 2.sp
    )
)
```

### HorizontalCenteredHeroCarousel

新的走马灯组件，适合首页轮播场景：

```kotlin
HorizontalCenteredHeroCarousel(
    items = heroItems,
    modifier = Modifier.height(300.dp)
) { item ->
    HeroCard(item)
}
```

### TimePicker 模式切换

```kotlin
TimePicker(
    state = timePickerState,
    layoutType = TimePickerLayoutType.Vertical,  // 或 Horizontal
    showModeToggle = true  // 启用时/分切换按钮
)
```

### Adaptive Panes 垂直拖拽手柄

大屏自适应布局的双栏/三栏面板，现在支持垂直拖拽调整宽度比：

```kotlin
ListDetailPaneScaffold(
    list = { ListPane() },
    detail = { DetailPane() },
    paneWidthConstraints = PaneWidthConstraints(
        preferredPrimaryPaneWidth = 400.dp,
        minPrimaryPaneWidth = 280.dp,
        maxPrimaryPaneWidth = 600.dp
    )
)
```

**拖拽手柄视觉更新：**
- 默认显示一个垂直拖拽指示器
- 拖拽时实时调整面板宽度
- 到达边界时自动吸附

## 关联主题

- [性能优化指南](./performance-guide.md)
- [Kotlin 2.x & Compose 性能优化](./kotlin2.md)
- [Compose 动画 API 进阶](./animation.md)
- [共用元素过渡动画](./shared-element.md)
- [Compose 测试最佳实践](./testing.md)
- [Material 3 自适应布局](./material3.md)
- [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)
