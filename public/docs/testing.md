# Compose 测试最佳实践 🧪

## 基本测试

```kotlin
@Test
fun MyScreenTest() {
    composeTestRule.setContent { MyScreen() }
    composeTestRule.onNodeWithText("Hello").assertExists()
    composeTestRule.onNodeWithText("Click Me").performClick()
}
```

## 常用匹配器

- `onNodeWithText()` - 按文本查找
- `onNodeWithContentDescription()` - 按内容描述查找
- `onNodeWithTag()` - 按测试标签查找

## 交互操作

- `performClick()` - 点击
- `performTextInput()` - 输入
- `performScrollTo()` - 滚动

## 最佳实践

1. 使用语义化匹配器
2. 使用 testTag 进行稳定定位
3. 像真实用户一样交互
4. 处理异步操作
