# Compose 测试最佳实践 🧪

> 摘要：Compose 测试的重点是从用户视角验证界面语义、交互和状态变化是否正确。
>
> 适用版本：Jetpack Compose Testing 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：测试，UI测试，语义，testTag

## 核心概念

Compose UI 测试不是去断言某个 View 是否存在，而是通过语义树查找节点、执行交互并验证结果。测试越贴近用户行为，越能在重构后保持稳定。

## 关键 API / 机制

- `setContent { ... }`：设置待测试界面。
- `onNodeWithText()`：按文本匹配节点。
- `onNodeWithContentDescription()`：按内容描述匹配节点。
- `onNodeWithTag()`：按测试标签稳定定位节点。
- `StandardTestDispatcher`：Compose 1.10+ 测试默认调度器，虚拟时间自动管理（无需手动推进）。

## 示例代码

```kotlin
@Test
fun MyScreenTest() {
    composeTestRule.setContent { MyScreen() }
    composeTestRule.onNodeWithText("Hello").assertExists()
    composeTestRule.onNodeWithText("Click Me").performClick()
}
```

## StandardTestDispatcher 默认化（Compose 1.10+）🧪

Compose 1.10 将 `StandardTestDispatcher` 设为默认测试调度器，对所有使用 `runTest` 的测试有直接影响。

**行为变化：**

```kotlin
// Compose 1.10+：虚拟时间自动管理
@Test
fun myTest() = runTest {
    // composeTestRule.setContent { ... }

    // 所有 Compose 协程和动画默认在虚拟时间执行
    // delay() 和动画帧不再阻塞测试
    val result = viewModel.data.first()
    assertThat(result).isEqualTo("expected")

    // 如需手动推进到当前待处理帧：
    // TestScope.runCurrent()
}
```

**优势：**
- 测试中的 `LaunchedEffect`、`rememberCoroutineScope` 默认在虚拟时间执行
- 异步状态测试代码更简洁，无需大量 `advanceTimeBy`
- 动画和 `delay()` 不再拖慢测试套件执行速度

**迁移注意：**
- 依赖旧 `TestFrameClock` 手动推进行为的测试需调整
- 性能基准测试需注意虚拟时间与实际时间的差异
- 建议显式使用 `TestScope.runCurrent()` 处理帧推进，而非依赖副作用

## 常见误区

- 过度依赖脆弱的文本匹配，导致文案调整后测试全部失效。
- 为了测试方便暴露不合理的实现细节。
- 忽略异步状态、动画和滚动场景，导致用例不稳定。

## 最佳实践

- 优先使用语义化节点与 `testTag` 组合定位。
- 测试用例尽量描述真实用户操作链路。
- 对异步更新、列表滚动和导航跳转场景单独补测试。

## 关联主题

- [Navigation Compose 进阶技巧](./nav-advanced.md)
- [平台集成总览](./platform.md)
- [remember / mutableStateOf](./state.md)
