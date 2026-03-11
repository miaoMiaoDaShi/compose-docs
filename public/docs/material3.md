# Material 3 自适应布局 📱

## 概念

Material 3 强调自适应布局，支持手机、平板、折叠屏和大屏幕设备。

## 代码示例

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

## 新特性

- **WindowSizeClass**: 根据窗口尺寸自动调整布局
- **ListDetailPaneScaffold**: 双栏布局模板
- **预测性返回**: 返回时预览目标页面
- **动态色彩**: 从壁纸提取颜色生成主题
