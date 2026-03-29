# Retain API 状态保留 🔄

> 摘要：`retain` 是 Compose 运行时引入的新 API，用于在配置变更和临时 UI 销毁时保留状态，填补 `remember` 与 `rememberSaveable` 之间的能力空白。
>
> 适用版本：Jetpack Compose 运行时（开发中，AOSP 阶段）
>
> 更新时间：2026-03-29
>
> 标签：状态，retain，rememberSaveable，状态持久化

## 核心概念

`retain` API 是 Compose 状态管理工具箱的新成员，设计目标是在 **临时 UI 销毁**（如配置变更、导航临时离开）和 **长期持久化** 之间取得平衡。

| API | 保留范围 | 需要 ViewModel | 适用场景 |
|-----|---------|---------------|---------|
| `remember` | 仅当前组合 | 否 | 单次重组内的临时状态 |
| `retain` | 配置变更 + 临时销毁 | 否 | 导航返回栈、中等生命周期状态 |
| `rememberSaveable` | 配置变更 + 进程死亡 | 否 | 需要 SavedStateHandle 持久化 |

## 关键 API / 机制

- `retain { initialValue }`：创建在临时销毁时可恢复的状态块。
- 当 ComposeView 存在时复用，不存在时创建新的。
- 自动关联 Android 生命周期所有者（Lifecycle、ViewModel、SavedState）。
- 无需 ViewModel 即可工作，适合轻量级状态保持。

## 示例代码

```kotlin
@Composable
fun FormScreen() {
    // 导航返回后，内容状态可保留
    val formState by retain { FormState() }

    Column {
        TextField(
            value = formState.name,
            onValueChange = { formState.name = it }
        )
        TextField(
            value = formState.email,
            onValueChange = { formState.email = it }
        )
    }
}

class FormState {
    var name by mutableStateOf("")
    var email by mutableStateOf("")
}
```

## 适用场景

- **导航返回栈保留**：从详情页返回列表页时，保持列表滚动位置和筛选状态。
- **配置变更保留**：屏幕旋转时保留表单输入、选中的标签页等。
- **临时退出保留**：用户临时切换到其他应用再返回时，状态不丢失。
- **昂贵计算结果**：不想每次重组都重新计算，但也不需要进程级别持久化。

## 常见误区

- 用 `retain` 替代 `rememberSaveable`：两者定位不同，`retain` 不能替代进程死亡后的恢复。
- 在跨进程或需要登录态持久化的场景使用：这种场景仍需 ViewModel + SavedStateHandle 或数据库。
- 滥用 `retain` 持有 ViewModel：它的设计初衷是轻量级状态，不应替代 ViewModel。

## 最佳实践

- 优先考虑状态提升，将 `retain` 用于真正需要跨临时销毁保留的 UI 状态。
- 保持状态类为简单 POJO，避免在其中执行业务逻辑或网络请求。
- 配合 `rememberSaveable` 使用——需要进程级别持久化的字段走 Saveable，需要频繁重建的字段走 retain。
- 在导航场景中，`retain` 可以替代过去用 ViewModel 持有列表页状态的做法，简化架构。

## 关联主题

- [remember / mutableStateOf](./state.md)
- [StateFlow / collectAsState](./stateflow.md)
- [Navigation Compose 3.0](./navigation.md)
- [Navigation Compose 进阶技巧](./nav-advanced.md)
