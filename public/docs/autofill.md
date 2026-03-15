# Autofill Support - 原生自动填充支持

> 摘要：Compose 1.8 引入的原生 autofill API，让表单填写更加便捷，支持密码管理器和自动填充服务。
>
> 适用版本：Compose 1.8+ / Kotlin 1.9+
>
> 更新时间：2026-03-14
>
> 标签：表单，autofill，用户体验，Compose 1.8

## 核心概念

在 Compose 之前，开发者需要使用复杂的 View-based 方案或第三方库来实现自动填充功能。Compose 1.8 引入了原生 autofill 支持，通过以下组件实现：

- **AutofillNode**：表示 autofill 树中的一个节点
- **AutofillTree**：管理所有 autofillable 节点的树结构
- **Autofill**：实际的自动填充操作接口

## 关键 API

- `AutofillNode`：创建 autofill 节点，定义填充类型和回调
- `Modifier.autofill()`：将可组合项标记为可自动填充
- `AutofillType`：定义填充类型（用户名、密码、邮箱、电话等）
- `contentType`：语义化内容类型，用于匹配系统 autofill 服务

## 示例代码

### 基本用法

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.Autofill
import androidx.compose.ui.autofill.AutofillNode
import androidx.compose.ui.autofill.AutofillType
import androidx.compose.ui.composed
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.toSize

@Composable
fun AutofillTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    autofillType: AutofillType,
    modifier: Modifier = Modifier
) {
    val autofill = LocalAutofill.current
    
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier
            .fillMaxWidth()
            .autofill(
                autofillTypes = listOf(autofillType),
                onFill = { onValueChange(it) }
            ),
        keyboardOptions = KeyboardOptions(keyboardType = when (autofillType) {
            AutofillType.EmailAddress -> KeyboardType.Email
            AutofillType.Phone -> KeyboardType.Phone
            else -> KeyboardType.Text
        })
    )
}
```

### 使用扩展函数的简洁写法

```kotlin
import androidx.compose.ui.autofill.LocalAutofill
import androidx.compose.ui.autofill.AutofillNode
import androidx.compose.ui.autofill.AutofillType
import androidx.compose.ui.composed

fun Modifier.autofillFill(
    autofillTypes: List<AutofillType>,
    onFill: (String) -> Unit
): Modifier = composed {
    val autofill = LocalAutofill.current
    
    if (autofill == null) {
        this
    } else {
        val node = remember {
            AutofillNode(
                autofillTypes = autofillTypes,
                onFill = onFill
            )
        }
        
        val ref = remember { mutableStateOf<ComposeRect?>(null) }
        
        LaunchedEffect(ref.value, node.boundingBox) {
            node.boundingBox = ref.value ?: return@LaunchedEffect
            autofill.nodeRequestFill(node)
        }
        
        this
            .onGloballyPositioned { coordinates ->
                ref.value = coordinates.size.toSize().toRect()
                    .translate(coordinates.positionInRoot())
            }
            .onFocusChanged { hasFocus ->
                if (hasFocus) {
                    autofill.nodeRequestFill(node)
                } else {
                    autofill.nodeCancelFill(node)
                }
            }
    }
}

@Composable
fun LoginForm() {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    
    Column {
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("邮箱") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.EmailAddress),
                    onFill = { email = it }
                ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
        )
        
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("密码") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.Password),
                    onFill = { password = it }
                ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
        )
    }
}
```

### 支持多种 autofill 类型

```kotlin
@Composable
fun CompleteRegistrationForm() {
    Column {
        // 姓名
        OutlinedTextField(
            value = "",
            onValueChange = {},
            label = { Text("姓名") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.Name),
                    onFill = {}
                )
        )
        
        // 电话
        OutlinedTextField(
            value = "",
            onValueChange = {},
            label = { Text("电话") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.Phone),
                    onFill = {}
                ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
        )
        
        // 地址
        OutlinedTextField(
            value = "",
            onValueChange = {},
            label = { Text("地址") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.AddressStreet, AutofillType.AddressCity),
                    onFill = {}
                )
        )
        
        // 信用卡（需要安全编辑框）
        OutlinedTextField(
            value = "",
            onValueChange = {},
            label = { Text("卡号") },
            modifier = Modifier
                .fillMaxWidth()
                .autofillFill(
                    autofillTypes = listOf(AutofillType.CreditCardNumber),
                    onFill = {}
                ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            visualTransformation = { text -> text }
        )
    }
}
```

## 常见误区

- **误区 1**：不指定 contentType → 系统无法确定填充什么类型的数据
- **误区 2**：忘记在 focus 变化时请求/取消 autofill → 导致意外填充或内存泄漏
- **误区 3**：autofill 修饰符放在错误位置 → 确保在布局修饰符之后、交互修饰符之前

## 最佳实践

- 为每个需要 autofill 的字段指定正确的 `AutofillType`
- 使用 `contentType` 参数让系统更好地匹配填充建议
- 处理密码字段时使用 `KeyboardOptions` 设置 `keyboardType = KeyboardType.Password`
- 确保在失去焦点时取消 autofill，避免不必要的回调
- 对于信用卡等敏感信息，考虑使用安全的文本字段配置

## 关联主题

- [@Composable 函数](./composable.md)
- [Modifier 修饰符](./modifier.md)
