# LookaheadAnimationVisualDebugging - 动画可视化调试 🛠️

> 摘要：Compose 1.11 引入的 `LookaheadAnimationVisualDebugging` 和 `CustomizedLookaheadAnimationVisualDebugging` 是两个专门用于调试 Lookahead 动画的可视化工具 composable，在预览窗口或设备上实时显示动画的"预测位置"、"目标位置"和"插值进度"，让开发者无需靠眼猜即可精准调试复杂的共享元素和边界动画。
>
> 适用版本：Compose 1.11.0-alpha01+ / Compose Animation 1.11.0-alpha01+
>
> 更新时间：2026-04-06
>
> 标签：动画，调试，Lookahead，Compose 1.11，可视化

## 背景：什么是 Lookahead 动画？

Lookahead（预测）动画是 Compose 动画系统中的一个高级特性：在动画正式开始之前，Compose 会预先计算目标布局的尺寸和位置，然后让元素"提前知道"自己要去哪里，从而实现更流畅、更自然的过渡效果。

典型应用场景：
- `SharedBounds`：列表项进入详情页时，共享图片/卡片的形态变化
- `AnimatedBounds`：布局边界变化时的动画（如 `Modifier.animateContentSize`）
- `ContainerTransform`：容器形状的变换动画

**问题**：调试这些动画时，开发者只能靠肉眼观察元素运动，无法量化"当前在哪一帧"、"预测位置和实际位置差多少"。

## LookaheadAnimationVisualDebugging

### 核心功能

`LookaheadAnimationVisualDebugging` 是一个顶层 composable，启用后会在**整个应用范围**显示所有活跃的 Lookahead 动画调试信息。

**显示内容：**

| 调试信息 | 说明 |
|---------|------|
| 元素当前帧位置 | 绿色边框，实时跟随 |
| 预测目标位置 | 蓝色虚线边框（动画结束时的位置） |
| 插值进度（Progress） | 0.0 → 1.0 的实时数值 |
| 速度向量（Velocity） | 手势驱动时显示速度和方向 |
| 预估完成帧数 | 基于当前速度计算 |

**基本用法：**

```kotlin
import androidx.compose.animation.LookaheadAnimationVisualDebugging

@Composable
fun App() {
    LookaheadAnimationVisualDebugging {
        // 应用所有动画都会显示调试叠加层
        MyMainContent()
    }
}
```

**调试某一段动画：**

```kotlin
LookaheadAnimationVisualDebugging(
    enabled = isDebugMode  // 通过状态控制开关
) {
    SharedBounds(
        sharedContentState = rememberSharedContentState(key = "item-$id")
    ) {
        ItemCard(item)
    }
}
```

**效果说明：**
- 启用后，屏幕上所有活跃的 Lookahead 动画元素都会被调试叠加层覆盖
- 适合在整个应用调试模式开启时使用
- 不会影响实际渲染，只是额外的调试信息叠加

### 与普通动画调试的区别

| 维度 | 普通 `debugPrint` | `LookaheadAnimationVisualDebugging` |
|------|-----------------|-------------------------------------|
| 可视化程度 | 数字日志 | 实时图形叠加 |
| 实时性 |事后查看 | 实时同步 |
| 预测位置 | 不可见 | 蓝色虚线框显示 |
| 帧进度 | 需自己计算 | 自动标注 |
| 适用场景 | 线上日志分析 | 开发调试 |

## CustomizedLookaheadAnimationVisualDebugging

### 核心功能

`CustomizedLookaheadAnimationVisualDebugging` 是精细化版本，允许针对**单个**共享元素或边界动画开启调试，而非整个应用范围。

**典型场景：**
- 只关心某个特定 `SharedBounds` 的动画
- 避免全屏调试叠加层干扰其他 UI
- 针对复杂列表中的特定项做单独调试

**基本用法：**

```kotlin
import androidx.compose.animation.CustomizedLookaheadAnimationVisualDebugging

@Composable
fun DetailScreen() {
    CustomizedLookaheadAnimationVisualDebugging(
        lookaheadInfo = lookaheadInfo,  // 来自对应动画的 lookahead 信息
        modifier = Modifier.sharedElement(...)
    ) {
        DetailImage(
            imageUrl = item.imageUrl,
            contentDescription = item.title
        )
    }
}
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `lookaheadInfo` | `LookaheadInfo` | 该动画元素的预测状态对象（由 Compose 动画系统内部维护） |
| `showLookaheadPosition` | `Boolean` | 是否显示预测目标位置（默认 true） |
| `showVelocity` | `Boolean` | 是否显示速度向量（默认 false） |
| `overlayColor` | `Color` | 调试叠加层的颜色（默认半透明绿） |

**获取 `lookaheadInfo`：**

`lookaheadInfo` 通常由参与 Lookahead 动画的 composable 自动维护，开发者通过 `lookaheadInfo` lambda 参数获取：

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "card-$id"),
    modifier = Modifier.customizedLookaheadAnimationDebugging(
        lookaheadInfo = it,  // 传递到调试组件
        showLookaheadPosition = true,
        showVelocity = true
    )
) { isFlashing ->
    CardContent(isFlashing)
}
```

## 实际调试示例

### 场景：调试共享元素动画的"跳变"问题

**症状**：列表项进入详情页时，图片有时会"跳"到错误位置再移正。

```kotlin
@Composable
fun SharedElementDebugDemo() {
    LookaheadAnimationVisualDebugging {
        SharedBounds(
            sharedContentState = rememberSharedContentState(key = "hero-image"),
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessMedium
            )
        ) {
            AsyncImage(
                model = currentImage,
                contentDescription = "Hero",
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
```

**调试步骤：**

1. 在模拟器/设备上打开此屏幕
2. 点击列表项，观察调试叠加层
3. 如果图片"跳变"：观察蓝色虚线框（预测位置）是否与绿色实线框（实际位置）偏差过大
4. 偏差大 → 说明 `lookaheadScope` 没有正确获取目标位置，检查 `key` 是否一致
5. 偏差小 → 动画曲线参数问题，调整 `spring` 的 `dampingRatio` / `stiffness`

### 场景：调试手势驱动的返回动画

**症状**：拖拽手势取消返回时，元素运动轨迹不符合预期。

```kotlin
@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun GestureDrivenAnimation() {
    LookaheadAnimationVisualDebugging(showVelocity = true) {
        SharedBounds(
            sharedContentState = rememberSharedContentState(key = "detail-card"),
            initialVelocity = gestureVelocity,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioNoBouncy,
                stiffness = Spring.StiffnessLow
            )
        ) {
            CardContent()
        }
    }
}
```

**观察指标：**
- 拖拽时：速度向量（Velocity）实时显示 → 判断初速度是否正确传入
- 取消拖拽：元素回弹 → 观察回弹方向是否指向预测位置
- 完成拖拽：插值进度（Progress）从 0→1 顺利走完

## 常见问题

### Q: 调试叠加层显示但动画本身不运行
确认动画的目标状态（`targetState` 或 `SharedBounds` 的 `sharedContentState`）已正确设置。

### Q: 预测位置框与实际位置偏差很大
检查 `SharedBounds` 的 `key` 在源页和目标页是否完全一致（包括字符串格式）。

### Q: `lookaheadInfo` 参数不知道从哪里获取
在大多数情况下，不需要手动传递 `lookaheadInfo`——直接使用 `LookaheadAnimationVisualDebugging` 包裹即可。

### Q: 调试叠加层遮挡 UI 无法操作
`LookaheadAnimationVisualDebugging` 支持通过状态控制开关：

```kotlin
var debugEnabled by remember { mutableStateOf(false) }

LookaheadAnimationVisualDebugging(enabled = debugEnabled) {
    // ...
}

// 双击任意位置切换调试模式
Modifier.noRippleClickable { debugEnabled = !debugEnabled }
```

## 最佳实践

1. **只在开发调试时启用**：通过 `BuildConfig.DEBUG` 或开发者选项控制，避免生产环境性能开销
2. **配合 Layout Inspector 使用**：`LookaheadAnimationVisualDebugging` 显示运行时动画状态，Layout Inspector 显示视图层级，两者互补
3. **关注预测位置与实际位置的偏差**：偏差大通常意味着动画起点计算有问题，而非动画曲线问题
4. **手势动画优先开启速度显示**：`showVelocity = true` 可以验证手势初速度是否正确传入
5. **特定元素调试用 `CustomizedLookaheadAnimationVisualDebugging`**：避免全屏叠加层干扰其他 UI

## 版本历史

| 版本 | 更新内容 |
|------|---------|
| Compose 1.11.0-alpha01 | 首次引入 `LookaheadAnimationVisualDebugging` 和 `CustomizedLookaheadAnimationVisualDebugging` |

## 关联主题

- [共用元素过渡动画](./shared-element.md)
- [Compose 动画 API 进阶](./animation.md)
- [Modifier.skipToLookaheadPosition](./shared-element.md#skipToLookaheadPosition)
