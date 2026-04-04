# TextFieldState 与输入输出转换 🔤

> 摘要：Material 3 1.4 / Compose Foundation 1.8 引入了全新的状态化 TextField API，核心是 `TextFieldState` 对象替代传统的 `value`/`onValueChange` 回调对，配合 `InputTransformation`（输入拦截）和 `OutputTransformation`（视觉转换）实现更清晰的关注点分离。
>
> 适用版本：Material 3 1.4+ / Compose Foundation 1.8+ / Compose BOM 2025.12.00+
>
> 更新时间：2026-04-04
>
> 标签：文本，TextField，TextFieldState，InputTransformation，OutputTransformation，状态化

## 核心概念

传统的 TextField 使用 `value` + `onValueChange` 回调模式：

```kotlin
// 旧模式：状态和 UI 紧耦合
var text by remember { mutableStateOf("") }
TextField(
    value = text,
    onValueChange = { text = it }
)
```

**问题**：
- 每次输入都触发 recomposition，即使只想过滤字符
- ViewModel 中的状态需要复制一份到 Composable
- `onValueChange` 里混合了"接收输入"和"更新状态"两个职责
- 无法在 UI 层方便地做输入格式化（如自动加千分位）

**新模式（TextFieldState）**：

```kotlin
// 新模式：状态与 UI 分离，转换函数可组合
val textFieldState = rememberTextFieldState()

TextField(
    state = textFieldState,
    placeholder = { Text("输入内容") }
)
```

`TextFieldState` 对象管理文本内容、光标位置、选区等完整状态，TextField 只负责渲染。转换逻辑通过 `InputTransformation` 和 `OutputTransformation` 注入，职责清晰。

## 核心 API 架构

```
用户输入
    │
    ▼
InputTransformation (可选)
  - 在输入进入状态前拦截
  - 可修改、可拒绝、可追加内容
    │
    ▼
TextFieldState (存储原始值)
  - 开发者读取/修改的永远是"业务值"
    │
    ▼
OutputTransformation (可选)
  - 仅改变视觉呈现
  - 不影响 TextFieldState 的内容
    │
    ▼
用户看到的结果
```

## InputTransformation — 输入拦截

`InputTransformation` 在用户输入被提交到 `TextFieldState` 之前执行，可以：
- 允许、修改或拒绝输入
- 自动追加内容（如输入数字后自动加单位）
- 实现自定义过滤逻辑

### 基础示例：只允许数字

```kotlin
import androidx.compose.foundation.text.input.InputTransformation
import androidx.compose.foundation.text.input.TextFieldState
import androidx.compose.foundation.text.input.filter
import androidx.compose.ui.text.input.KeyboardType

val state = rememberTextFieldState()

TextField(
    state = state,
    inputTransformation = InputTransformation { text, buildAnnotatedString ->
        // filter 会自动拒绝不匹配的字符
        text.filter { it.isDigit() }
    },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
    modifier = Modifier.fillMaxWidth()
)
```

Compose Foundation 提供了 `filter` 快捷方式用于简单字符过滤。对于复杂场景，直接实现 `InputTransformation`：

```kotlin
// 自定义 InputTransformation：自动追加单位
val weightInputTransformation = InputTransformation { buffer, buildAnnotated ->
    val text = buffer.text
    // 确保以 "kg" 结尾
    if (!text.endsWith(" kg") && text.isNotEmpty()) {
        val filtered = text.filter { it.isDigit() || it == '.' }
        if (filtered.isNotEmpty()) {
            buffer.replace(0, buffer.length, "$filtered kg")
        }
    }
}

val weightState = rememberTextFieldState(initialText = "")
TextField(
    state = weightState,
    inputTransformation = weightInputTransformation,
    suffix = { Text("kg") },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
)
```

### 典型使用场景

| 场景 | InputTransformation 用法 |
|------|------------------------|
| 手机号输入 | 自动格式化 "+86 xxx xxxx xxxx" |
| 金融金额 | 自动加千分位（如 1,234,567） |
| 密码强度检查 | 拒绝不含特殊字符的密码 |
| IP 地址输入 | 每段限 3 位数字，自动跳格 |
| 标签输入 | 按空格/回车自动生成 tag chip |

### 与旧 `onValueChange` 的对比

```kotlin
// 旧模式：格式化逻辑分散在 onValueChange
var text by mutableStateOf("")
TextField(
    value = text,
    onValueChange = { newValue ->
        // 格式化逻辑和状态更新混在一起
        val formatted = formatWithCommas(newValue.filter { it.isDigit() })
        text = formatted
    }
)

// 新模式：关注点分离
val state = rememberTextFieldState()
TextField(
    state = state,
    inputTransformation = InputTransformation { buffer, _ ->
        val digitsOnly = buffer.text.filter { it.isDigit() }
        if (buffer.text != digitsOnly) {
            buffer.replace(0, buffer.length, digitsOnly)
        }
    }
)
```

## OutputTransformation — 视觉转换

`OutputTransformation` 在 `TextFieldState` 的内容渲染到屏幕之前执行，只改变**视觉呈现**，不影响底层状态。

**典型场景**：
- 密码字段显示为 `••••••`（实际值是明文）
- 金额字段显示千分位（底层是无格式数字）
- 脱敏显示（显示 `****1234` 而实际是完整卡号）

### 示例：千分位格式化（输出时加逗号）

```kotlin
import androidx.compose.foundation.text.input.OutputTransformation
import androidx.compose.ui.savestate.TextFieldValue

val amountState = rememberTextFieldState(initialText = "1234567")

TextField(
    state = amountState,
    outputTransformation = OutputTransformation { textFieldValue ->
        // 将纯数字转换为千分位格式
        val digits = textFieldValue.text.filter { it.isDigit() }
        val formatted = digits.reversed().chunked(3).joinToString(",").reversed()
        TextFieldValue(
            text = formatted,
            selection = textFieldValue.selection,
            composition = null
        )
    },
    prefix = { Text("¥ ") },
    placeholder = { Text("0.00") }
)
```

**注意**：`OutputTransformation` 中**不能修改 selection（选区）**，只能修改 text 和 composition。修改选区的操作会被忽略。

### 实际案例：信用卡号脱敏

```kotlin
val cardState = rememberTextFieldState(initialText = "")

TextField(
    state = cardState,
    outputTransformation = OutputTransformation { value ->
        val digits = value.text.filter { it.isDigit() }
        val masked = when {
            digits.length <= 4 -> digits
            else -> "**** **** **** ${digits.takeLast(4)}"
        }
        TextFieldValue(
            text = masked,
            selection = value.selection, // 选区保持不变
            composition = null
        )
    },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
    placeholder = { Text("**** **** **** ****") }
)
```

### Input vs Output 转换的核心区别

| 维度 | InputTransformation | OutputTransformation |
|------|---------------------|---------------------|
| 执行时机 | 内容进入状态之前 | 内容显示到屏幕之前 |
| 是否影响 TextFieldState | ✅ 是（可修改原始值） | ❌ 否（只改变视觉） |
| 可修改选区 | ✅ 可以 | ❌ 不可以（被忽略） |
| 典型用途 | 过滤字符、自动补全 | 密码遮蔽、千分位显示 |
| 性能影响 | 每次输入都执行 | 每次 recomposition 都执行 |

## TextFieldState 状态管理

`TextFieldState` 支持 `rememberTextFieldState()`，对于需要跨屏幕保留的场景：

```kotlin
// 单个 Composable 内使用
val state = rememberTextFieldState(initialText = "hello")

// 需要跨 recomposition 保持时，使用 rememberSaveable
val savedState = rememberSaveable {
    mutableStateOf(TextFieldState(initialText = ""))
}

// 在 ViewModel 中共享（推荐方式）
// ViewModel 中持有 TextFieldState
class MyViewModel : ViewModel() {
    val usernameState = TextFieldState()
    val passwordState = TextFieldState()
}

// Composable 中使用
@Composable
fun LoginScreen(viewModel: MyViewModel = viewModel()) {
    Column {
        TextField(
            state = viewModel.usernameState,
            label = { Text("用户名") }
        )
        SecureTextField(
            state = viewModel.passwordState,
            label = { Text("密码") }
        )
    }
}
```

## SecureTextField 安全文本字段

`SecureTextField` 是基于 `TextFieldState` 的密码专用组件，自动配置安全选项：

```kotlin
val passwordState = rememberTextFieldState()

SecureTextField(
    state = passwordState,
    placeholder = { Text("请输入密码") },
    // 自动设置：autoCorrect = false, keyboardType = Password
    // 无需手动配置 keyboardOptions
)
```

## 迁移指南

### 从旧 TextField 迁移

```kotlin
// 旧写法
var username by rememberSaveable { mutableStateOf("") }
TextField(
    value = username,
    onValueChange = { username = it },
    label = { Text("用户名") }
)

// 新写法
val usernameState = rememberTextFieldState()
TextField(
    state = usernameState,
    label = { Text("用户名") }
)

// 读取值：从 state.text 获取
Button(onClick = {
    val name = usernameState.text  // 而不是直接读 username
}) { Text("提交") }
```

### 在 ViewModel 中迁移

```kotlin
// 旧写法
data class LoginUiState(
    val username: String = "",
    val password: String = ""
)

// 新写法：ViewModel 直接持 TextFieldState
class LoginViewModel : ViewModel() {
    val usernameState = TextFieldState()
    val passwordState = TextFieldState()

    fun login() {
        // 直接从 TextFieldState 读取
        viewModelScope.launch {
            auth.login(
                username = usernameState.text,
                password = passwordState.text
            )
        }
    }
}
```

## 最佳实践

- **优先使用 `TextFieldState` 新 API**，旧的 `value`/`onValueChange` 模式最终会被取代
- **InputTransformation 只做输入拦截**，不要在里头做业务逻辑（如 API 调用）
- **OutputTransformation 必须是纯函数**，给定相同 state 内容，输出永远相同
- **密码场景用 `SecureTextField`**，不要自己用 `OutputTransformation` 做遮罩
- **在 ViewModel 中持有 `TextFieldState`**，而不是在 Composable 里，提升可测试性
- **不要在 InputTransformation 里做网络验证**，这会导致每次按键都发请求——用 `derivedStateOf` + 延迟验证

## 常见误区

- 误以为 OutputTransformation 改变了 state 的值——它只影响视觉呈现
- 在 InputTransformation 里修改选区会导致意外行为——选区修改应在 InputTransformation 之前通过其他机制处理
- 用 InputTransformation 替代表单验证——转换是 UI 层的，验证是业务逻辑层的，各司其职

## 关联主题

- [富文本与 AnnotatedString](./rich-text.md)
- [Autofill 原生支持](./autofill.md)
- [Compose 动画 API 进阶](./animation.md)
- [Material 3 自适应布局](./material3.md)
