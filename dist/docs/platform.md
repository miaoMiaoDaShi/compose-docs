# 平台集成总览 🔌

> 摘要：这是一篇平台集成导航页，用于汇总 Compose 与原生 Android 能力对接时的几个常见方向。
>
> 适用版本：Jetpack Compose 与对应平台库常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：平台集成，总览，AndroidView

## 核心概念

Compose 并不意味着要脱离原生 Android 能力。很多成熟能力仍然来自平台库或传统 View 组件，常见做法是通过 `AndroidView`、副作用 API 和专用 Modifier，把这些能力安全地接入 Compose 页面。

## 关键 API / 机制

- `AndroidView`：在 Compose 中承载传统 View 组件。
- 生命周期管理：确保相机、播放器等对象按时初始化与释放。
- 输入/拖放 Modifier：承载原生交互能力的 Compose 接口。
- 平台权限与状态同步：避免只接入视图而忽略资源管理。

## 示例代码

```kotlin
AndroidView(
    factory = { context ->
        SomePlatformView(context)
    },
    modifier = Modifier.fillMaxSize()
)
```

## 子主题导航

- [CameraX 与 Compose](./camerax-compose.md)
- [Media3 播放器集成](./media3-compose.md)
- [Compose 拖放交互](./drag-and-drop.md)

## 常见误区

- 以为 Compose 页面里不能再用 View 组件。
- 只把平台控件“显示出来”，却没有管理权限、资源释放和状态同步。
- 把多个平台能力堆在一篇文档里，后期难以扩展和维护。

## 最佳实践

- 平台能力优先按主题拆分文档，而不是长期堆在总表里。
- 每种能力都单独说明依赖对象、生命周期和常见坑点。
- 总览页只做导航，不重复承载所有正文。

## 关联主题

- [CameraX 与 Compose](./camerax-compose.md)
- [Media3 播放器集成](./media3-compose.md)
- [Compose 拖放交互](./drag-and-drop.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
