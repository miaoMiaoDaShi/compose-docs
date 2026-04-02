# Material Ripple 独立波纹效果库 💧

> 摘要：`material-ripple` 是 Compose Material 1.11 新增的独立 artifact，将波纹（Ripple）效果从 Material 主库中剥离，允许非 Material 设计体系的应用独立使用波纹交互效果。
>
> 适用版本：Compose Material 1.11.0-alpha01+ / BOM 2026.03.00+
>
> 更新时间：2026-04-03
>
> 标签：交互，波纹，Ripple，Material，Indication

## 核心概念

波纹（Ripple）是 Material Design 中触摸反馈的核心机制。传统上，Ripple API 绑定在 `compose.material` 或 `compose.material3` 库中，引入后会自动附带整套 Material 组件。Compose Material 1.11 将 Ripple 抽取为独立库 `material-ripple`，解决了非 Material UI 想使用波纹效果时的依赖负担。

## 核心 API

### `ripple()` Modifier 扩展

```kotlin
// 独立使用波纹效果（无需 Material 库）
import androidx.compose.material.ripple.ripple

@Composable
fun CustomButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = Color.Gray)  // 波纹颜色可自定义
            ) { onClick() },
        shape = RoundedCornerShape(8.dp),
        color = Color.LightGray
    ) {
        Text("自定义按钮", modifier = Modifier.padding(16.dp))
    }
}
```

### `RippleConfiguration` 全局配置

```kotlin
// 为整个应用配置默认波纹颜色和透明度
@Composable
fun App() {
    CompositionLocalProvider(
        LocalRippleConfiguration provides RippleConfiguration(
            color = Color.Blue,
            rippleAlpha = 0.3f
        )
    ) {
        // 应用内容
    }
}
```

### `rememberRipple`（旧 API，已迁移）

```kotlin
// 旧写法（Compose 1.10 及之前）
rememberRipple(color = Color.Gray)

// 新写法（Compose 1.11+）
ripple(color = Color.Gray)
```

## 与 Indication 的关系

Ripple 是 `Indication` 接口的一种实现。`Modifier.clickable` 和 `Modifier.indication` 接受 `Indication` 实例，Ripple 是最常用的 Indication 实现。

```kotlin
// 等价写法
Modifier.clickable(
    interactionSource = remember { MutableInteractionSource() },
    indication = ripple()  // Compose 1.11+ 推荐
)

// 等价于旧写法
Modifier.clickable(
    interactionSource = remember { MutableInteractionSource() },
    indication = rememberRipple()  // 已弃用
)
```

## 与 Material 库的关系

| 维度 | compose.material | compose.material3 | material-ripple |
|------|-----------------|-------------------|-----------------|
| 包含波纹 | ✅ | ✅ | ✅ |
| Material 组件 | ✅ 完整 | ✅ 完整 | ❌ 仅波纹 |
| 依赖大小 | 较大 | 较大 | **轻量** |
| 适用场景 | Material Design App | Material 3 App | 自定义设计体系 |

## 迁移指南

如果你的项目使用了旧版 `rememberRipple()`，迁移到 `ripple()` 非常简单：

**依赖更新：**

```groovy
// build.gradle.kts
dependencies {
    // 原来使用 compose.material 或 compose.material3
    // 现在可以单独引入 ripple
    implementation("androidx.compose.material:material-ripple:1.11.0-alpha01")
}
```

**API 替换：**

```kotlin
// 旧（已弃用）
import androidx.compose.material.rememberRipple
indication = rememberRipple(color = Color.Gray)

// 新（1.11+ 推荐）
import androidx.compose.material.ripple.ripple
indication = ripple(color = Color.Gray)
```

## 常见误区

- **误以为必须迁移**：`rememberRipple` 仍可使用（仅标记为弃用），在 Material 库中仍然有效。
- **为非 Material App 引入整个 Material 库**：现在可以只引入 `material-ripple`，保持应用包体积更小。
- **混淆 RippleTheme 和 RippleConfiguration**：RippleTheme 是旧 API，RippleConfiguration 是 1.11 引入的新配置方式。

## 最佳实践

1. **非 Material 应用**：直接引入 `material-ripple` 而非整个 Material 库。
2. **自定义设计系统**：用 `ripple()` 配合品牌色，保持波纹风格一致。
3. **全局配置**：在应用入口用 `LocalRippleConfiguration` 统一设置波纹颜色和透明度。
4. **关注无障碍**：波纹效果本身满足触摸目标最小 48dp 的 Material 要求。

## 关联主题

- [Modifier 修饰符](./modifier.md)
- [Material 3 自适应布局](./material3.md)
- [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)
