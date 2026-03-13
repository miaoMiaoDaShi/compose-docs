# Material 3 自适应布局 📱

> 摘要：Material 3 的自适应布局能力帮助 Compose 页面在手机、平板和大屏上维持一致体验。
>
> 适用版本：Material 3 与 Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：Material3，自适应，大屏，WindowSizeClass

## 核心概念

现代 Android 界面不再只面向单一手机尺寸。Material 3 强调根据窗口尺寸动态调整布局层级、面板数量和导航形式，让同一套界面在不同设备上都能保持可读性与操作效率。

## 关键 API / 机制

- `WindowSizeClass`：根据窗口尺寸决定布局策略。
- `ListDetailPaneScaffold`：适合主从式双栏布局。
- 动态色彩：从系统色板中生成主题。
- 预测性返回：为导航返回提供更平滑的过渡体验。

## 示例代码

```kotlin
@Composable
fun AdaptiveLayout() {
    WindowSizeClass.calculateFromSize(LocalConfiguration.current.screenSizeDp) {
        when (windowSizeClass) {
            WindowSizeClass.Compact -> SinglePaneContent()
            WindowSizeClass.Medium -> ListDetailPaneScaffold(
                list = { ListPane() },
                detail = { DetailPane() }
            )
            WindowSizeClass.Expanded -> ThreePaneLayout()
        }
    }
}
```

## 常见误区

- 只做手机单栏布局，然后把大屏强行拉伸。
- 把“响应式”和“自适应”混为一谈，忽略交互结构调整。
- 不区分内容密度，直接把所有内容都塞进双栏或三栏。

## 最佳实践

- 先按窗口尺寸定义布局策略，再决定组件摆放方式。
- 对列表详情、导航栏和抽屉这类区域做差异化设计。
- 自适应布局优先考虑信息层级，而不只是屏幕宽度。

## 关联主题

- [布局组件 Box / Row / Column](./box-row-column.md)
- [Navigation Compose 3.0](./navigation.md)
- [平台集成总览](./platform.md)
