# Text Context Menu 自定义 🍽️

> 摘要：Compose 1.9 引入的 `Modifier.appendTextContextMenuComponents()` 和 `Modifier.filterTextContextMenuComponents()` 允许在文本选择上下文菜单中动态添加或移除菜单项，实现剪贴板增强、翻译、搜索等自定义功能。
>
> 适用版本：Compose 1.9+（August 2025 Release） / Compose BOM 2025.08.00+
>
> 更新时间：2026-04-07
>
> 标签：文本，交互，Modifier，Compose 1.9

## 摘要

在移动端文本输入场景中，上下文菜单（长按文本弹出的菜单）是用户与文字交互的核心入口。Compose 1.9 之前，开发者无法向这个系统菜单注入自定义行为。新引入的两个修饰符彻底改变了这一局面：

- **`Modifier.appendTextContextMenuComponents()`**：向菜单追加自定义菜单项
- **`Modifier.filterTextContextMenuComponents()`**：从菜单中移除指定默认项

这两个 API 可以组合使用，实现"增强型剪贴板"、"一键翻译"、"搜索选中文本"等高价值功能，且无需 fork Compose 源码或使用私有 API。

## 核心概念

### 工作原理

两个修饰符都作用于支持文本选择的 `Text` / `BasicTextField` / `TextField` 组件。当用户长按选中文本时，系统菜单弹出前会调用修饰符中注册的回调：

- `appendTextContextMenuComponents`：在菜单末尾追加自定义项
- `filterTextContextMenuComponents`：接收一个过滤器函数，返回 `true` 保留该项，返回 `false` 从菜单中移除

### 与传统定制方案的对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Android View 系统 `ActionMode.Callback` | 完全控制 | 需要 View-based 代码，Compose 中不自然 |
| `SelectionContainer` + 自定义手势 | 可在 Compose 中实现 | 无法影响系统上下文菜单 |
| **新 API（append/filter）** | ✅ Compose 原生、声明式、无 fork | 依赖系统菜单，存在平台差异 |

### 平台行为差异

| 平台 | 系统菜单 | 新 API 支持 |
|------|---------|-----------|
| Android 14+ | 动态化菜单（Dynamic Color 等） | ✅ 完整支持 |
| Android 13 | 标准化菜单 | ✅ 支持 |
| iOS (CMP) | 平台原生菜单 | ⚠️ 受限，取决于 `usingNativeTextInput` |

## 示例代码

### 基本用法：追加自定义菜单项

```kotlin
import androidx.compose.foundation.text.selection.selectionEnabled
import androidx.compose.foundation.text.contextmenu.TextContextMenuItem
import androidx.compose.foundation.text.contextmenu.textContextMenuItems
import androidx.compose.foundation.text.contextmenu.filterTextContextMenuComponents

@Composable
fun EnhancedTextSelection(text: String) {
    Text(
        text = text,
        modifier = Modifier
            .textContextMenuItems(
                items = listOf(
                    TextContextMenuItem(
                        text = "🔍 搜索",
                        onClick = { selectedText ->
                            // 打开搜索页面或跳转搜索引擎
                            openSearch(selectedText)
                        }
                    ),
                    TextContextMenuItem(
                        text = "📋 复制为引用",
                        onClick = { selectedText ->
                            // 复制时添加引用格式
                            clipboardManager.setText("「$selectedText」")
                        }
                    )
                )
            )
    )
}
```

### 追加+过滤组合使用

```kotlin
@Composable
fun CustomizedTextField(
    value: String,
    onValueChange: (String) -> Unit
) {
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            // 先追加自定义项
            .appendTextContextMenuComponents(
                listOf(
                    TextContextMenuItem(
                        text = "📝 添加注释",
                        onClick = { selectedText ->
                            showCommentDialog(selectedText)
                        }
                    )
                )
            )
            // 再过滤掉"分享"选项（不需要应用内分享）
            .filterTextContextMenuComponents { item ->
                item.text != "Share" && item.text != "分享"
            },
        textStyle = TextStyle(fontSize = 16.sp)
    )
}
```

### 过滤器：移除不需要的默认项

```kotlin
@Composable
fun CleanTextField(value: String, onValueChange: (String) -> Unit) {
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .filterTextContextMenuComponents { item ->
                // 保留：剪切、复制、粘贴、全选
                item.text in listOf("Cut", "Copy", "Paste", "Select All") ||
                item.text in listOf("剪切", "复制", "粘贴", "全选")
            }
    )
}
```

### 配合 InputTransformation 使用

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartTextField() {
    var text by remember { mutableStateOf("") }

    TextField(
        value = text,
        onValueChange = { text = it },
        modifier = Modifier
            .appendTextContextMenuComponents(
                items = listOf(
                    TextContextMenuItem(
                        text = "🌐 翻译",
                        onClick = { selected ->
                            translateText(selected)
                        }
                    )
                )
            ),
        label = { Text("输入文字") }
    )
}
```

## TextContextMenuItem 数据类

```kotlin
data class TextContextMenuItem(
    val text: String,                    // 菜单项显示文本
    val icon: ImageVector? = null,       // 可选图标
    val onClick: (selectedText: String) -> Unit  // 点击回调，参数为当前选中文本
)
```

## 常见误区

- **在 `filterTextContextMenuComponents` 中过滤所有项目**：这会让菜单变空，用户无法进行基本操作。应至少保留"剪切/复制/粘贴/全选"
- **在回调中执行耗时操作**：文本菜单回调在 UI 线程执行，避免网络请求等阻塞操作
- **硬编码菜单文本做过滤**：不同系统和语言版本菜单文本不同，用 `contains` 或通配符比精确匹配更健壮
- **追加项过多**：每个追加项都会出现在菜单中，过多项目会干扰原生体验，建议不超过 3 项
- **`onClick` 中直接修改状态**：回调运行在菜单关闭流程中，修改状态可能导致不可预期行为，建议用 `LaunchedEffect` 延迟处理

## 最佳实践

1. **增强剪贴板场景**：追加"复制为引用格式"、"复制后自动搜索"等实用选项
2. **翻译/搜索场景**：追加"翻译选中文本"、"在浏览器中搜索"，利用 `Intent` 调起外部应用
3. **隐私保护场景**：过滤掉"网络搜索"等可能泄露隐私的选项
4. **企业应用场景**：追加"复制到工作区"、"标记待处理"等业务特定操作
5. **测试注意**：上下文菜单行为依赖系统实现，真机测试优于模拟器

## 关联主题

- [富文本与 AnnotatedString](./rich-text.md) — 文本局部样式
- [TextFieldState 与输入输出转换](./text-field-state.md) — 状态化文本输入
- [Autofill 原生支持](./autofill.md) — 表单自动填充
