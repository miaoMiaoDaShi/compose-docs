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

## 示例代码

```kotlin
@Test
fun MyScreenTest() {
    composeTestRule.setContent { MyScreen() }
    composeTestRule.onNodeWithText("Hello").assertExists()
    composeTestRule.onNodeWithText("Click Me").performClick()
}
```

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
