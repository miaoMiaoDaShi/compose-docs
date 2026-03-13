# CameraX 与 Compose 📷

> 摘要：这篇文档介绍如何在 Compose 页面中接入 CameraX 预览能力，并处理常见生命周期问题。
>
> 适用版本：Jetpack Compose 与 CameraX 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：CameraX，相机，AndroidView，平台集成

## 核心概念

CameraX 目前仍然大量依赖平台组件和生命周期对象。Compose 通常通过 `AndroidView` 承载 `PreviewView`，再把相机的初始化、权限和释放逻辑放到合适的生命周期中管理。

## 关键 API / 机制

- `AndroidView`：在 Compose 中嵌入 `PreviewView`。
- `PreviewView`：相机预览的常见承载容器。
- 生命周期绑定：确保相机资源在页面可见期间被正确占用和释放。
- 权限处理：访问相机前需要明确申请权限。

## 示例代码

```kotlin
@Composable
fun CameraPreview() {
    AndroidView(
        factory = { context ->
            PreviewView(context).apply {
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
```

## 常见误区

- 只把 `PreviewView` 放进页面，却没有真正绑定 CameraX 生命周期。
- 忽略权限申请和拒绝后的兜底界面。
- 在重组频繁发生的位置重复初始化相机对象。

## 最佳实践

- 把相机初始化与资源释放收敛到稳定生命周期中。
- 预览、拍照和分析等能力尽量分层封装。
- 先确认权限与设备能力，再进入相机页面。

## 关联主题

- [平台集成总览](./platform.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
- [Compose 测试最佳实践](./testing.md)
