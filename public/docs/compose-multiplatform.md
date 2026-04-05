# Compose Multiplatform 跨平台开发 🌍

> 摘要：介绍 Compose Multiplatform（KMP Compose）如何用同一套 Kotlin 代码库覆盖 Android、iOS、Desktop 和 Web 四端。
>
> 适用版本：Compose Multiplatform 1.11.0-beta01+ / Kotlin 2.2+ / Android Studio Ladybug+
>
> 更新时间：2026-04-06
>
> 标签：跨平台，Kotlin Multiplatform，iOS，Desktop，Web，KMP

## 核心概念

Compose Multiplatform（原名 Compose Desktop/Web）由 JetBrains 主导，基于 Kotlin Multiplatform（KMP）技术将 Jetpack Compose 的声明式 UI 能力扩展到 Android 以外的平台。与 Flutter 不同，Compose Multiplatform 复用 Compose API，平台差异化部分通过 KMP 条件编译和 expect/actual 机制处理。

**支持的平台：**
- Android（与 Jetpack Compose 完全兼容）
- iOS（稳定版，支持生产环境）
- Desktop（Windows / macOS / Linux）
- Web（通过 Wasm 或 JS Canvas）

## Android 与 Compose Multiplatform 的关系

两者都叫 "Compose"，但有本质区别：

| 维度 | Jetpack Compose | Compose Multiplatform |
|------|----------------|----------------------|
| 主导 | Google | JetBrains |
| 平台 | 仅 Android | Android + iOS + Desktop + Web |
| 运行时 | Android View 系统 | 平台原生渲染（Skia for Desktop/iOS） |
| 依赖 | AndroidX | org.jetbrains.compose 插件 |

实践中，Android 项目直接使用 `androidx.compose.*`；而 KMP 跨平台项目使用 `org.jetbrains.compose.*` 依赖，通过 BOM 统一版本。

## 快速上手

### 项目结构（Gradle KMP）

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin") version "1.9.22" apply false
    id("org.jetbrains.compose") version "1.6.0" apply false
}
```

```kotlin
// build.gradle.kts（shared 模块）
plugins {
    id("org.jetbrains.compose")
}

composeMultiplatform {
    iosTarget()
    desktopTarget()
}

commonMain {
    dependencies {
        implementation(compose.runtime)
        implementation(compose.foundation)
        implementation(compose.material3)
    }
}
```

### iOS 配置（Xcode 要求）

- 需安装 Xcode 15+
- iOS 编译通过 Kotlin/Native
- 运行时使用 iOS 原生 UI 框架（SwiftUI/UIKit 底层）

### Web 配置（Gradle）

```kotlin
kotlin {
    js(IR) {
        browser()
        binaries.executable()
    }
}
```

Web 端支持两种渲染后端：
- **JS Canvas**：兼容所有浏览器，无额外依赖
- **Wasm**：性能更好，需要浏览器支持 Wasm GC（2025 年主流浏览器均已支持）

## 平台差异化策略

Compose Multiplatform 通过 expect/actual 机制处理平台差异：

```kotlin
// commonMain
expect fun getPlatformName(): String

// androidMain
actual fun getPlatformName() = "Android"

// iosMain
actual fun getPlatformName() = "iOS"

// desktopMain
actual fun getPlatformName() = "Desktop"
```

UI 层面，`@Composable` 函数在各平台行为一致，但需要区分平台 API 调用（如权限、网络等）。

## iOS 特定注意事项

- **Compose 1.7+** 对 iOS 端做了大量性能优化，iOS 渲染引擎从 SKIA 切换到平台原生渲染路径
- iOS 上不支持某些 Android 特有 API（如 `Modifier.platformModifier`）
- 内存管理与 Android 不同，需注意 Kotlin/Native 的 Objective-C/Swift 互操作规则

### Native iOS Text Input（Compose Multiplatform 1.11.0+）

> 适用于：Compose Multiplatform 1.11.0-beta01+ / Kotlin 2.2+

Compose Multiplatform 1.11.0 引入了**原生 iOS 文本输入模式**，解决了长期困扰 iOS 端的文本输入体验问题。

**核心问题：**
- 传统 Compose `BasicTextField` 在 iOS 上使用 Skia 渲染文本，无法调用 iOS 原生输入法
- 无法使用 iOS 系统文本操作（翻译、查询、分享等上下文菜单）
- 文本输入性能和键盘响应不如原生 SwiftUI

**启用方式：**

```kotlin
import androidx.compose.ui.text.input.PlatformImeOptions

@Composable
fun NativeTextFieldSample() {
    BasicTextField(
        value = text,
        onValueChange = { text = it },
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        platformImeOptions = PlatformImeOptions(
            usingNativeTextInput = true  // 启用原生 iOS 文本输入
        )
    )
}
```

**支持的功能：**
- ✅ iOS 原生拼音/五笔输入法完整支持
- ✅ 系统文本上下文菜单（翻译、查询、分享）
- ✅ 听写（Dictation）支持
- ✅ 文本替换建议

**注意事项：**
- 需要 `PlatformImeOptions` 的 `usingNativeTextInput(enabled)` 显式启用
- `TextFieldValue` 和 `TextFieldState` 两种 API 均支持
- 仅在 iOS 目标生效，其他平台调用此 API 无效果

**版本要求：**
- iOS 15.0+（通过 Kotlin/Native 工具链自动处理）
- Compose Multiplatform 1.11.0-beta01+

### iOS Dialog / Popup 视图层级变更（1.11.0-beta01）

> 适用于：Compose Multiplatform 1.11.0-beta01+

**行为变化：**
Compose Multiplatform 1.11.0-beta01 起，iOS 上的 `Dialog` 和 `Popup` 的容器视图改为放在 **SwiftUI Host 上方的系统转场视图（system transition view）** 中。

**影响：**
- 模态对话框和弹出层现在与 iOS 系统 UI 层级关系更一致
- Safe Area 处理逻辑有变化，开发者需注意原本依赖视图层级计算的逻辑
- 已有 Dialog/Popup 自定义行为的项目建议在真机上测试

**适配建议：**
- 若 Dialog/Popup 出现层级遮挡问题（如被键盘遮挡、被系统栏切割），需要重新评估 `layoutInflater` 和视图插入点
- 涉及 Dialog 自定义动画的项目，需要检查与系统转场视图的兼容性

### Web 滚动性能大幅改进（1.11.0-beta01）🌐

> 适用于：Compose Multiplatform 1.11.0-beta01+ / Web (JS/Wasm)

Compose Multiplatform 1.11.0 重点改进了 **Web 端滚动性能**，这是 Web 目标长期以来的痛点。

**问题背景：**
Compose Web 的滚动体验长期以来落后于原生 UI，主要原因是触控处理（touch processing）架构存在效率问题。

**本次修复内容：**
- 大量重构了 Web 端的触控事件处理逻辑
- 滚动惯性、弹性边界（overscroll）、触控命中测试等核心路径重新优化
- Compose Web 滚动体验现已与其他平台（iOS/Android/Desktop）基本持平

**受益场景：**
- `LazyColumn` / `LazyRow` 长列表滚动
- 嵌套滚动场景（如 ViewPager 内嵌 LazyColumn）
- 移动端 Web（触控滚动）

**版本要求：**
- Compose Multiplatform 1.11.0-beta01+

### Shader API 重构与 Skiko 更新（1.11.0-beta01）🎨

> 适用于：Compose Multiplatform 1.11.0-beta01+ / Desktop / iOS / Web（非 Android）

**Shader 类型重构：**

Compose Multiplatform 1.11.0-beta01 对 `Shader` 类型做了平台差异化处理：

```kotlin
// 旧写法（1.10.x）：Shader 是 Skia Shader 的 typealias
import org.jetbrains.skia.Shader

// 新写法（1.11.0+）：Shader 是 Compose 独立封装类
import androidx.compose.ui.graphics.Shader
import androidx.compose.ui.graphics.composeShader
```

**迁移示例：**

```kotlin
// 旧写法
val shader = Shader.makeLinearGradient(...)

// 新写法（Compose Multiplatform 1.11.0+）
val shader = composeShader {
    drawRect(
        brush = Brush.linearGradient(colors)
    )
}
```

**Skiko 版本更新：**
- Skia via Skiko 已更新至 **Milestone 144**
- 包含 Skia 最新稳定版的安全修复和性能改进

**Apple x86_64 支持移除：**
- Compose Multiplatform 1.11.0-beta01 **不再支持 Apple x86_64 目标**
- 因为 Kotlin/Native 已弃用 x86_64 Apple 目标，Compose Multiplatform 跟随移除
- 受影响用户需迁移至 Apple Silicon (arm64) 构建设备

**版本要求：**
- Compose Multiplatform 1.11.0-beta01+
- Kotlin 2.2+（推荐）

## WindowInsetsRulers 窗口插入区探测（1.10.0）📐

> 适用于：Compose Multiplatform 1.10.0+ / 所有平台

Compose Multiplatform 1.10.0 引入了 **`WindowInsetsRulers`**，提供基于窗口插入区（Status Bar、Navigation Bar、On-Screen Keyboard）精确定位和调整 UI 元素的 API。

**背景问题：**
在多平台开发中，窗口插入区的处理一直是跨平台 UI 的痛点。不同平台的状态栏、导航栏和软键盘高度差异巨大，手动计算既繁琐又容易出错。

**核心 API：**

```kotlin
import androidx.compose.foundation.layout.WindowInsetsRulers

@Composable
fun AdaptiveContent() {
    // 获取当前窗口插入区的读取器
    val windowInsets = WindowInsetsRulers.current

    // 读取各方向插入区数值
    val statusBarHeight = with(LocalDensity.current) {
        windowInsets.statusBars.asPaddingValues().calculateTopPadding().toPx()
    }

    val navBarHeight = with(LocalDensity.current) {
        windowInsets.navigationBars.asPaddingValues().calculateBottomPadding().toPx()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(
                top = WindowInsetsCInsets.statusBars.asPaddingValues().calculateTopPadding()
            )
    ) {
        // 根据插入区自动调整内容位置
    }
}
```

**典型使用场景：**

| 场景 | 说明 |
|------|------|
| 全屏沉浸内容 | 自动避开 Status Bar，不被系统栏遮挡 |
| 底部导航栏适配 | 根据 Navigation Bar 高度调整底部固定元素位置 |
| 键盘弹出布局 | 键盘显示时自动调整布局，避免输入框被遮挡 |
| 折叠屏/多窗口 | 窗口大小变化时实时响应插入区变化 |

**优势：**
- 跨平台统一 API，无需为各平台写 expect/actual
- 与 `Modifier.statusBarsPadding()` / `Modifier.navigationBarsPadding()` 互补（后者是修饰符层面直接应用，此 API 是数值读取层面）
- 支持 `PaddingValues` 和原始 `Dp` 两种取值方式

**版本要求：**
- Compose Multiplatform 1.10.0+

## PredictiveBackHandler 跨平台预测性返回（1.10.0）🔮

> 适用于：Compose Multiplatform 1.10.0+ / iOS + Desktop（非 Android）

Compose Multiplatform 1.10.0 引入了 **`PredictiveBackHandler`** API，将 Android 原生的 Predictive Back（预测性返回）手势带到非 Android 平台。这是跨平台手势交互的重要里程碑。

**背景：**
Android 13+ 的 Predictive Back 允许用户在执行返回操作前预览目标页面，提供更直观的导航体验。在此之前，iOS 和 Desktop 平台无法使用此功能。

**核心 API：**

```kotlin
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.animation.predictiveBack

@Composable
fun BackGestureSample(
    onNavigateBack: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        // PredictiveBackHandler 拦截返回手势
        PredictiveBackHandler(
            onBack = {
                // 手势完成时的回调
                onNavigateBack()
            },
            onProgress = { progress: Float ->
                // 手势进行中的进度回调（0.0 到 1.0）
                // 可用于驱动自定义动画
            }
        ) {
            // 手势捕获区域（通常是整个屏幕或边缘区域）
            BackGestureArea {
                // 这里可以放置背景预览内容
                // 在手势过程中实时显示返回目标的预览
            }
        }
    }
}
```

**与 Android 的差异：**

| 维度 | Android（Jetpack Compose） | Compose Multiplatform |
|------|---------------------------|----------------------|
| 触发方式 | 系统级返回手势 | `PredictiveBackHandler` 手动集成 |
| 进度回调 | `PredictiveBackHandler` 同名 API | 相同 API |
| 系统预览 | 系统自动渲染 | 需要在 `BackGestureArea` 中手动实现预览 |
| Navigation 集成 | Navigation Compose 2.8+ 内置 | 需要手动处理返回栈 |

**自定义预览动画示例：**

```kotlin
PredictiveBackHandler(
    onBack = { onNavigateBack() },
    onProgress = { progress ->
        // progress 0.0~1.0 驱动过渡动画
        val scale = 1f - (progress * 0.1f)
        val alpha = 1f - progress
        previousScreenScale = scale
        previousScreenAlpha = alpha
    }
) {
    // 返回目标的预览内容
    // 通常是上一个页面的快照或模糊背景
    PreviousScreenPreview(
        modifier = Modifier
            .scale(previousScreenScale)
            .alpha(previousScreenAlpha)
    )
}
```

**注意事项：**
- iOS 端需要 iOS 13.0+；Desktop 端支持 Windows/macOS/Linux
- `PredictiveBackHandler` 在 Android 平台存在但无效果（Android 使用系统级 Predictive Back）
- 与 Navigation Compose 配合使用时，需要手动同步返回栈状态

**版本要求：**
- Compose Multiplatform 1.10.0+

## 原生互操作视图自动调整大小（1.10.0）📱💻

> 适用于：Compose Multiplatform 1.10.0+ / iOS + Desktop

Compose Multiplatform 1.10.0 为**原生互操作视图（Native Interop Views）**添加了**自动调整大小**支持，解决了混编项目中 UI 布局的长期痛点。

**问题背景：**

在 KMP 项目中，经常需要将原生 UIView（iOS）或 Native Panel（Desktop）嵌入到 Compose 界面中。传统方案需要开发者手动计算和同步原生视图的大小与 Compose 布局，代码繁琐且容易出现不同步的 Bug。

**新方案 — 自动调整大小：**

```kotlin
import androidx.compose.ui.awt.awtComposeEditor

@Composable
fun InteropViewSample() {
    // Compose 自动管理原生视图的布局
    // 无需手动同步 size 或 position
    AndroidView(
        factory = { context ->
            MyNativeView(context).apply {
                // Compose 自动调用此回调通知大小变化
                onSizeChanged = { width, height ->
                    // 以前需要在这里手动同步给 Compose
                    // 现在由框架自动处理
                }
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            // 高度由原生视图内容决定
    )
}
```

**Desktop（Windows/macOS/Linux）互操作示例：**

```kotlin
import androidx.compose.ui.awt.invoke
import androidx.compose.ui.awt.ComposePanel

@Composable
fun DesktopInteropSample() {
    // Swing Panel 自动适应 Compose 布局约束
    ComposePanel().apply {
        setContent {
            // Compose 内容嵌入 Swing Panel
        }
    }
}
```

**iOS UIKit 互操作示例：**

```kotlin
import androidx.compose.ui.interop.uiKitView

@Composable
fun IOSInteropSample() {
    uiKitView(
        factory = {
            // 原生 UIKit 视图
            MyCustomUIView()
        },
        modifier = Modifier
            .height(200.dp)
            .fillMaxWidth()
        // 宽度自动适应容器，无需手动管理
    )
}
```

**迁移建议：**

如果项目中有手动同步原生视图大小的代码，可以移除这些手动逻辑：

```kotlin
// 可以删除的旧代码（Compose Multiplatform 1.10.0+ 不再需要）
var composeSize by remember { mutableStateOf(IntSize.Zero) }

Box(
    modifier = Modifier
        .onSizeChanged { size -> composeSize = size }
) {
    // 手动同步逻辑 → 可以删除
}

// 新方案：框架自动处理
Box {
    NativeInteropView()
}
```

**版本要求：**
- Compose Multiplatform 1.10.0+
- iOS 15.0+ / Desktop（所有主流平台）

## Compose Multiplatform 1.10.0 附加变更 ⚙️

> 适用于：Compose Multiplatform 1.10.0-beta01+

### 依赖别名弃用

Compose Multiplatform Gradle Plugin 提供的依赖别名（如 `compose.ui`、`compose.foundation` 等）在 1.10.0-beta01 起**正式弃用（Deprecated）**。

**弃用原因：**
这些别名与 Android Jetpack Compose 的依赖名称冲突，容易造成混淆，且与 Kotlin Multiplatform 的标准模块命名规范不一致。

**受影响别名：**

| 旧别名（弃用） | 推荐替代 |
|---------------|---------|
| `compose.ui` | `androidx.compose.ui` |
| `compose.foundation` | `androidx.compose.foundation` |
| `compose.material` | `androidx.compose.material` |
| `compose.material3` | `androidx.compose.material3` |
| `compose.animation` | `androidx.compose.animation` |

**迁移方式：**

```kotlin
// build.gradle.kts（shared 模块）
commonMain {
    dependencies {
        // ❌ 旧写法（弃用）
        implementation(compose.ui)
        implementation(compose.foundation)

        // ✅ 新写法
        implementation("androidx.compose.ui:ui")
        implementation("androidx.compose.foundation:foundation")
        implementation("androidx.compose.material3:material3")
    }
}
```

**建议：**
- 新项目直接使用 `androidx.compose.*` 完整依赖
- 已有项目逐步替换，避免未来版本冲突

### AGP 9.0.0 支持

Compose Multiplatform 1.10.0 正式支持 **Android Gradle Plugin（AGP）9.0.0**。

**升级注意：**
- AGP 9.0.0 要求 Gradle 8.6+
- 部分旧版 Gradle 配置（如 `kotlin.daemon.jvm.options`）需要调整
- 建议通过 Android Studio Ladybug+ 新建项目验证 AGP 9.0.0 兼容性

## Hot Reload 1.0.0 正式版 🔥

> 适用于：Compose Multiplatform 1.10.0+ / Compose Multiplatform Gradle Plugin

Compose Multiplatform 1.10.0 将 **Hot Reload** 升级为 **v1.0.0 正式版**，这是桌面端开发效率的重大提升。

**核心改进：**
- ✅ **内置插件**：不再需要手动安装额外依赖，直接内置于 `org.jetbrains.compose` Gradle 插件
- ✅ **默认启用**：无需任何额外配置，新建项目默认开启
- ✅ **桌面端支持**：支持 Desktop（Windows / macOS / Linux）的热重载，修改 UI 代码保存后即时预览效果
- ✅ **状态保持**：在不丢失当前 `remember` 状态的情况下重新渲染 UI，提升调试迭代效率

**触发方式：**
Hot Reload 会在 IDE 文件保存时自动触发 Compose 重组机制，自动调用重组（Recompose），无需手动干预。

**注意事项：**
- Hot Reload 主要适用于 UI 层的快速预览，复杂状态重置或全量重建场景仍需重启
- iOS 端热重载能力受限于 Swift 编译模式，与 Desktop 体验有所不同
- Web 端通过 Wasm/JS Canvas 刷新页面实现类似效果

**版本要求：**
- Compose Multiplatform 1.10.0+
- Android Studio Ladybug+ 或 IntelliJ IDEA 2024.2+

## Common @Preview 统一预览注解 🎨

> 适用于：Compose Multiplatform 1.10.0+ / 所有平台

Compose Multiplatform 1.10.0 引入了 **统一的 `@Preview` 注解**，终于解决了多平台项目预览注解混乱的问题。

**历史问题：**

以前在 KMP 项目中使用预览，需要为不同平台使用不同的注解：

```kotlin
// ❌ 旧写法：每个平台注解不同
// Android 端
@Preview
@Composable fun MyPreview() { ... }

// Desktop 端（需要 desktop 包的 Preview）
// @Preview @Composable  // desktop.ui 包

// iOS 端无预览支持，需在真机/模拟器上查看
```

**统一写法（1.10.0+）：**

```kotlin
// ✅ 新写法：一个注解，所有平台通用
@Preview
@Composable
fun MyPreview() {
    MyAppTheme {
        MainScreen()
    }
}
```

`@Preview` 现在可以直接写在 `commonMain` 源代码集中，Android Studio / IDEA 会在对应平台的预览面板中自动渲染。

**支持的预览参数（与 Android Jetpack Compose 保持一致）：**

```kotlin
@Preview(
    name = "深色模式",
    group = "主题",
    widthDp = 360,
    heightDp = 640,
    fontScale = 1.5f,
    showSystemUi = true
)
@Composable
fun DarkModePreview() {
    MyAppTheme(darkTheme = true) {
        MainScreen()
    }
}
```

**注意事项：**
- `@Preview` 预览依赖 IDE 的 Compose 预览渲染引擎，各平台支持程度略有差异
- Android Studio Ladybug+ / IntelliJ IDEA 2024.2+ 支持此功能
- iOS 端预览通过桌面/Android Studio 的 Canvas 渲染，不代表最终 iOS 渲染效果，重要场景仍需真机验证

## Navigation 3 非 Android 端支持 🧭

> 适用于：Compose Multiplatform 1.10.0+ / Navigation Compose 3.0+

Compose Multiplatform 1.10.0 正式将 **Navigation 3** 扩展到 **非 Android 平台**（iOS、Desktop、Web），终于可以在所有 Compose 目标平台上使用统一的导航库。

**核心改进：**
- ✅ **统一 API**：Android 和非 Android 平台使用相同的 Navigation API，不再需要平台特定分支
- ✅ **类型安全路由**：支持 Kotlin 序列化参数传递，避免字符串路由的错误
- ✅ **NavHost 跨平台**：iOS 和 Desktop 的 `NavHost` 实现与 Android 行为一致
- ✅ **深层链接支持**：在 Desktop/Web 端同样支持 URL 深层链接

**示例代码（跨平台统一写法）：**

```kotlin
@Composable
fun MainNavHost() {
    NavHost(
        navController = rememberNavController(),
        startDestination = "home"
    ) {
        composable("home") { HomeScreen() }
        composable("detail/{itemId}") { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}
```

**升级注意事项：**
- 从旧版 Navigation 迁移时需注意 `navArguments` 的类型声明变化
- iOS 端的返回栈行为与 Android 略有差异，建议在目标平台实测
- 确认 `navigation-compose` 依赖版本为 3.0+：`org.jetbrains.compose.navigation:navigation-compose:3.0.0+`

## 官方模板归档事件（2026 年 3 月）⚠️

> 适用于：Compose Multiplatform 项目初始化

**重要变更：**

JetBrains 官方维护的 `compose-multiplatform-template` GitHub 仓库已于 **2026 年 3 月正式归档（Archived）**，不再接受更新。这标志着 Compose Multiplatform 从"官方提供基础模板"转向"社区提供生产级模板"的生态过渡。

**归档原因：**
- 基础模板无法覆盖真实项目的复杂度（依赖注入、CI/CD、平台特定配置等）
- 社区生产级模板（如 KMPShip）已经提供了更完整的起点
- JetBrains 将资源集中在 Compose Multiplatform 核心框架本身

**对项目的影响：**

| 维度 | 影响 |
|------|------|
| 新建项目 | 不再能使用 `git clone` 官方模板，需要使用社区模板或手动初始化 |
| 已有项目 | 不受影响，继续维护 |
| 学习参考 | 归档仓库仍可阅读，但部分配置可能过时 |

**推荐替代方案：**

1. **KMPShip**（kmp.ship.app）：生产级 Compose Multiplatform 启动模板，内置 Hilt、快速发布配置和平台特定脚手架
2. **Kotlin Multiplatform Wizard**（jetbrains.com）：官方在线项目生成器，可选 Compose UI 模块
3. **手动初始化**：通过 Gradle 手动搭建，参考 [kotlinlang.org 官方文档](https://kotlinlang.org/docs/multiplatform-set-up.html)

**从归档模板迁移到生产模板的建议检查项：**

```markdown
- [ ] 依赖注入方案（Hilt / Koin / 手动 DI）
- [ ] iOS CocoaPods 集成配置
- [ ] Android minSdk / targetSdk 版本
- [ ] CI/CD 流水线（GitHub Actions / Bitrise）
- [ ] 多平台资源文件组织（moko-resources）
- [ ] 发布配置（Google Play / App Store）
```

## 与 Jetpack Compose 的版本同步

Compose Multiplatform 的版本与 Jetpack Compose BOM 保持同步：
- Compose BOM 2024.01.00 对应 Multiplatform 1.6.x
- Compose BOM 2025.01.00 对应 Multiplatform 1.7.x

建议始终通过 Compose BOM 管理版本，避免 transitive dependency 冲突。

## 最佳实践

- **共享 UI，差异化逻辑**：业务逻辑通过 KMP expect/actual 差异化，UI 层尽量共享
- **依赖管理**：优先使用 Compose Multiplatform BOM，减少版本不一致问题
- **iOS 调试**：使用 Xcode 调试 Swift 代码，Android Studio 调试 Kotlin 代码
- **测试**：Compose Multiplatform 1.6+ 提供通用 UI 测试 API，可跨平台复用

## 常见误区

- 以为 Android 的 Compose API 完全等于 Multiplatform —— 某些 AndroidX 库不可跨平台
- 直接在 Compose Multiplatform 里调用 Android 平台 API —— 需通过 KMP 条件化
- 忽视平台差异盲目追求 100% 代码复用 —— 平台特有交互和视觉需要单独适配

## 关联主题

- [平台集成总览](./platform.md)
- [Material 3 自适应布局](./material3.md)
- [性能优化指南](./performance-guide.md)
