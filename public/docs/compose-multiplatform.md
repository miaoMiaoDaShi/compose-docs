# Compose Multiplatform 跨平台开发 🌍

> 摘要：介绍 Compose Multiplatform（KMP Compose）如何用同一套 Kotlin 代码库覆盖 Android、iOS、Desktop 和 Web 四端。
>
> 适用版本：Compose Multiplatform 1.10.0+ / Kotlin 1.9+ / Android Studio Ladybug+
>
> 更新时间：2026-04-01
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
