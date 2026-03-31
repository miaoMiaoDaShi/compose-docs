# Jetpack Compose XR 空间计算 🚀

> 摘要：Jetpack Compose XR 是 Android XR SDK 的声明式 UI 框架，允许使用 Compose API 构建空间计算应用中的浮窗、面板和交互界面，将传统 2D Android UI 扩展到三维空间。
>
> 适用版本：Android XR SDK + androidx.xr.compose 1.0.0-alpha12+
>
> 更新时间：2026-03-31
>
> 标签：XR，空间计算，Spatial Panel，Android XR，AR/VR

## 核心概念

Android XR 是 Google 推出的空间计算平台，首批硬件包括三星 XR 头显和联想 XR 企业设备，搭载骁龙 XR3 芯片。Jetpack Compose XR 在这个生态中扮演核心角色——它让你用熟悉的 Compose API 构建**空间面板（Spatial Panel）**和**轨道器（Orbiter）**，将 2D UI 带入沉浸式三维空间。

**关键组件**：

- **SpatialPanel**：浮窗容器，将现有 Compose 或 View UI 放置在用户视野中的三维空间位置
- **SpatialRow / SpatialColumn**：空间布局容器，定义面板内的排列方式
- **Orbiter**：跟随锚点或 AR 设备移动的内容轨道器
- **SpatialExternalSurface**：外部渲染表面，支持 180°/360° 半球和球体立体图像渲染

## 关键 API / 机制

### SpatialPanel - 空间面板

```kotlin
// androidx.xr.compose.subspace
@Composable
fun SpatialPanel(
    modifier: Modifier = Modifier,
    spatialLayout: SpatialLayout = SpatialLayout.MainPanel,
    // 可选：跟随锚点
    followTarget: FollowTarget? = null,
    content: @Composable SpatialPanelScope.() -> Unit
)
```

### SpatialLayout 类型

| 类型 | 说明 |
|------|------|
| `SpatialLayout.MainPanel` | 主面板，适合主应用界面 |
| `SpatialLayout.Secondary` | 次级面板，适合辅助内容 |
| `SpatialLayout.Floating` | 悬浮面板，可自由定位 |

### 空间布局

```kotlin
@Composable
fun SpatialRow(
    modifier: Modifier = Modifier,
    horizontalAlignment: Alignment.Horizontal = Alignment.Start,
    verticalArrangement: Arrangement.Vertical = Arrangement.Top,
    content: @Composable RowScope.() -> Unit
)

@Composable
fun SpatialColumn(
    modifier: Modifier = Modifier,
    verticalArrangement: Arrangement.Vertical = Arrangement.Top,
    content: @Composable ColumnScope.() -> Unit
)
```

### 跟随目标（Orbiter）

```kotlin
// 内容跟随 AR 锚点或设备位置
@Composable
fun FollowingSubspace(
    target: FollowTarget,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
)

// 创建锚点跟随目标
val anchorFollow = rememberAnchorFollowTarget(anchorEntity)
```

### 外部渲染表面

```kotlin
// 180° 半球立体渲染
@Composable
fun SpatialExternalSurface180Hemisphere(
    modifier: Modifier = Modifier,
    content: (GraphicsContext) -> Unit
)

// 360° 球体立体渲染
@Composable
fun SpatialExternalSurface360Sphere(
    modifier: Modifier = Modifier,
    content: (GraphicsContext) -> Unit
)
```

## 完整示例

```kotlin
// Android XR Session 中承载 Compose XR UI
@Composable
fun XRSampleApp() {
    // 创建或获取 XR Session
    val session = rememberXRSession()
    
    SpatialSubspaceLayout {
        // 主空间面板
        SpatialPanel(
            spatialLayout = SpatialLayout.MainPanel,
            modifier = Modifier
                .width(400.dp)
                .height(300.dp)
        ) {
            // 标准 Compose UI
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Spatial UI",
                    style = MaterialTheme.typography.headlineMedium
                )
                
                Button(onClick = { /* 交互 */ }) {
                    Text("Click Me")
                }
            }
        }
        
        // 悬浮次级面板（跟随锚点）
        SpatialPanel(
            spatialLayout = SpatialLayout.Floating,
            followTarget = anchorFollow
        ) {
            Card {
                Text("Following Panel")
            }
        }
    }
}
```

## 依赖配置

```kotlin
// build.gradle.kts
dependencies {
    // XR Compose 核心库
    implementation("androidx.xr.compose:compose:1.0.0-alpha12")
    
    // XR Material3 组件
    implementation("androidx.xr.compose:compose-material3:1.0.0-alpha01")
    
    // XR SceneCore（场景图管理）
    implementation("androidx.xr.scenecore:scenecore:1.0.0-alpha12")
}
```

## 最佳实践

1. **面板尺寸设计**：空间面板使用 dp 单位，但在 XR 环境中用户可以自由缩放，建议设计响应式布局
2. **2D 到 3D 迁移**：优先将现有 Compose UI 放入 SpatialPanel，再逐步利用空间特性增强体验
3. **性能考虑**：XR 应用对帧率要求更高（至少 60fps），避免在 SpatialPanel 中使用复杂的重组
4. **焦散感知**：Material Design for XR 指南提供了专为空间 UI 设计的组件，遵循它可以获得更好的用户体验

## 限制与注意事项

- **alpha 阶段**：xr.compose 1.0.0-alpha12 仍是早期版本，API 可能在正式版前发生变化
- **设备限制**：目前仅支持特定 XR 设备（骁龙 XR3 平台），不支持普通 Android 手机
- **平台要求**：需要 Android XR SDK 环境，普通 Android 应用无法直接运行

## 关联主题

- [Platform 平台集成总览](./platform.md)
- [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)
- [Material 3 自适应布局](./material3.md)
