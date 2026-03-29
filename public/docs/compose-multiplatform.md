# Compose Multiplatform 跨平台开发 🌍

> 摘要：介绍 Compose Multiplatform（KMP Compose）如何用同一套 Kotlin 代码库覆盖 Android、iOS、Desktop 和 Web 四端。
>
> 适用版本：Compose Multiplatform 1.6+ / Kotlin 1.9+ / Android Studio Ladybug+
>
> 更新时间：2026-03-28
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
