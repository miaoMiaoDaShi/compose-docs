# Accompanist 工具库集 🧰

> 摘要：Accompanist 是 Google 维护的 Compose 实验室库，提供官方 Compose 尚未覆盖的实用能力，包括权限请求、系统 UI 控制、Drawable 渲染和布局工具。
>
> 适用版本：Accompanist 0.34+ / Jetpack Compose 与 Compose Multiplatform 通用
>
> 更新时间：2026-03-28
>
> 标签：工具库，权限，系统 UI，Drawable，导航动画

## 核心概念

Accompanist 并非 Google 官方稳定库，而是一个"实验室"环境，用于：
1. 验证 Compose 新 API 的可行性
2. 填补官方库尚未覆盖的能力空白
3. 收集社区反馈以影响官方 API 设计

**重要提示：** 随着官方 Compose 库能力完善，部分 Accompanist 功能已被官方接管（如 edge-to-edge、系统栏控制），建议优先使用官方 API，仅在官方不支持时才使用 Accompanist。

## 主要模块一览

| 模块 | 用途 | 官方替代 |
|------|------|---------|
| `accompanist-permissions` | 运行时权限请求 | Android 13+ 官方 scoped storage |
| `accompanist-systemuicontroller` | 系统栏（状态栏/导航栏）样式 | WindowCompat（AndroidX） |
| `accompanist-drawablepainter` | 将 Android Drawable 渲染为 Compose Painter | 官方 Icon 等 |
| `accompanist-adaptive` | 屏幕折叠/分屏等自适应布局工具 | WindowSizeClass（官方） |
| `accompanist-navigation-animation` | 导航过渡动画 | androidx.navigation 2.7+ |
| `accompanist-navigation-material` | Material 导航组件（BottomSheet） | 官方 Material3 BottomSheet |
| `accompanist-appcompat-theme` | 将 AppCompat 主题适配到 Compose | 官方 Material3 迁移 |

## Permissions 权限请求

这是 Accompanist 最常用的模块，解决了 Compose 中没有官方权限 API 的问题。

### 核心 API

```kotlin
// 权限状态数据类
data class PermissionStatus(
    val granted: Boolean,
    val shouldShowRationale: Boolean
)

// 多权限状态
typealias PermissionsState = MultiplePermissionsState

// 启动权限请求
val permissionsLauncher = rememberMultiplePermissionsPermissionLauncher(
    permissions = listOf(
        Manifest.permission.Camera,
        Manifest.permission.Location
    )
)

// 在Composable中使用
val cameraPermissionState = rememberPermissionState(
    Manifest.permission.CAMERA
)

Button(
    onClick = { cameraPermissionState.launchPermissionRequest() }
) {
    Text(if (cameraPermissionState.status.granted) "已授权" else "授权相机")
}
```

### 完整示例

```kotlin
@Composable
fun CameraPermissionRequest() {
    val cameraPermissionState = rememberPermissionState(
        Manifest.permission.CAMERA
    )

    when {
        cameraPermissionState.status.granted -> {
            CameraPreview() // 已授权，显示相机预览
        }
        cameraPermissionState.status.shouldShowRationale -> {
            // 用户之前拒绝过，显示解释
            Column {
                Text("相机权限是实现此功能必需的")
                Button(onClick = { cameraPermissionState.launchPermissionRequest() }) {
                    Text("授予权限")
                }
            }
        }
        else -> {
            // 首次请求或用户永久拒绝
            Button(onClick = { cameraPermissionState.launchPermissionRequest() }) {
                Text("授权相机")
            }
        }
    }
}
```

### 局限性

- 无法区分"首次请求"和"用户永久拒绝"——两者都返回 `granted = false`
- 权限结果依赖系统本身行为，Accompanist 只能包装不能扩展
- Android 13+ 的精细权限（如 photo picker）需要使用系统 picker 而不是权限 API

## System UI Controller

用于动态控制状态栏、导航栏的颜色和图标颜色（配合 edge-to-edge 使用）。

**推荐迁移：** AndroidX 的 `WindowCompat` 已提供 equivalent 功能，官方建议迁移：

```kotlin
// 旧（Accompanist）
SystemUIController(window).isStatusBarVisible = false

// 新（官方）
WindowCompat.setDecorFitsSystemWindows(window, false)
```

## Drawable Painter

将 Android 的 `Drawable` 对象渲染为 Compose 的 `Painter`，可用于任何接受 `painter` 的场景：

```kotlin
@Composable
fun DrawableAsPainter() {
    val drawable = remember {
        ContextCompat.getDrawable(context, R.drawable.ic_star)
    }

    Image(
        painter = rememberDrawablePainter(drawable = drawable),
        contentDescription = "星标"
    )
}
```

## Adaptive 布局工具

提供 `calculateDisplayFeatures(activity)`，返回屏幕的折叠状态、分屏位置等信息：

```kotlin
val activity = LocalContext.current as Activity
val displayFeatures = remember(activity) {
    calculateDisplayFeatures(activity)
}

displayFeatures.forEach { feature ->
    when (feature) {
        is Fold -> println("折叠位置: ${feature.bounds}")
        is Separating -> println("分屏中")
    }
}
```

## 依赖配置

```kotlin
dependencies {
    // 请根据官方最新版本调整
    implementation("com.google.accompanist:accompanist-permissions:0.34.0")
    implementation("com.google.accompanist:accompanist-drawablepainter:0.34.0")
    implementation("com.google.accompanist:accompanist-adaptive:0.34.0")
}
```

## 最佳实践

- **优先官方**：官方已提供的功能不要使用 Accompanist 版本
- **版本锁定**：Accompanist 是实验性库，固定版本号，避免自动升级
- **关注迁移指南**：官方每次发布新版本后，检查 Accompanist 是否有对应的迁移文档
- **测试**：Accompanist API 不在官方测试保障范围内，使用时需额外测试

## 常见误区

- 把 Accompanist 当作稳定库使用 —— 它明确声明是实验性的
- 混用官方和 Accompanist 的重叠功能 —— 如同时用 WindowCompat 和 SystemUIController
- 不检查官方是否已支持就默认使用 Accompanist —— 很多功能已在 AndroidX 中有官方替代

## 关联主题

- [CameraX 与 Compose](./camerax-compose.md)
- [平台集成总览](./platform.md)
- [Autofill 原生支持](./autofill.md)
