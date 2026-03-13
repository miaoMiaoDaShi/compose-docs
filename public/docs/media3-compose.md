# Media3 播放器集成 🎞️

> 摘要：这篇文档介绍如何在 Compose 中接入 Media3 播放器，并处理播放器状态与生命周期。
>
> 适用版本：Jetpack Compose 与 Media3 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：Media3，播放器，AndroidView，平台集成

## 核心概念

视频播放通常仍然依赖平台播放器视图。Compose 通过 `AndroidView` 承载 `PlayerView`，再把播放器对象的创建、绑定、暂停和释放放进更稳定的状态和生命周期管理中。

## 关键 API / 机制

- `PlayerView`：Media3 播放界面的常见宿主视图。
- `AndroidView`：把播放器视图嵌入 Compose 布局。
- 播放器生命周期：页面切换时处理暂停、恢复与释放。
- 状态同步：把播放状态和界面控制分离。

## 示例代码

```kotlin
@Composable
fun VideoPlayer() {
    AndroidView(
        factory = { context -> PlayerView(context) },
        modifier = Modifier.fillMaxSize()
    )
}
```

## 常见误区

- 只创建 `PlayerView`，却没有统一管理播放器实例。
- 页面销毁后仍然持有播放器资源。
- 把播放逻辑和页面展示逻辑全部写在一个 Composable 中。

## 最佳实践

- 把播放器实例和页面 UI 解耦。
- 进入后台、切换页面和销毁页面时明确处理播放器状态。
- 为加载中、错误态和播放结束等场景准备清晰反馈。

## 关联主题

- [平台集成总览](./platform.md)
- [Compose 动画 API 进阶](./animation.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
