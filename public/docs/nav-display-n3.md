# [自动收集] Navigation 3 NavDisplay 与声明式返回栈 🧭

> 摘要：Navigation 3 引入了全新的声明式返回栈 API——`rememberNavBackStack` + `NavDisplay` + `entry()` DSL。与传统的 `navController.navigate()` 命令式 API 相比，返回栈本身成为 Compose State（`SnapshotStateList`），导航即是对列表的增删操作。Nav3 还通过 Scenes API 原生支持多窗格（List-Detail）布局，这是自 2018 年 Navigation 库发布以来最大的架构转变。
>
> 适用版本：Navigation Compose 3.0+ / Kotlin 2.0+ / Kotlin Serialization 2.0+
>
> 更新时间：2026-04-04
>
> 标签：导航，Navigation3，NavDisplay，ScenesAPI，声明式，NavKey，多窗格

## 背景：Nav2 的历史局限

Navigation Compose 2（Navigation Compose 2020~2025）在架构上继承自 2018 年的 Jetpack Navigation。它的核心问题是：**返回栈（Back Stack）对 Compose 是不透明的**。`navController.navigate()` 是命令式的，Compose 只能通过 `currentBackStackEntryAsState()` 观察结果，无法直接控制栈本身。

这导致了几个长期痛点：
- **两个真相源**：`NavController` 内部维护一份返回栈，Compose State 维护另一份，两者需要手动同步
- **难以观察嵌套返回操作**：多步快速返回时，Compose 只能观察到最终状态
- **多窗格布局需要自行实现**：`NavHost` 本质上是单窗格 API，List-Detail 需要手动拼接

Navigation 3 通过**将返回栈直接暴露为 Compose State** 彻底解决了这个问题。

## 核心概念：返回栈即 State

Navigation 3 的核心理念是：**返回栈本身就是一个 `SnapshotStateList<NavKey>`**。Compose 观察这个列表，导航就是对这个列表的增删操作。

```
Nav2（命令式）                          Nav3（声明式）
navController.navigate(DetailRoute)    backStack.add(DetailRoute)
navController.popBackStack()           backStack.removeLastOrNull()
navController.clearBackStack()         backStack.clear()

返回栈藏在 NavController 内部            返回栈就是 remember{} 中的 State
```

## rememberNavBackStack —— 创建声明式返回栈

```kotlin
import androidx.navigation.compose.NavDestination
import androidx.navigation.compose.rememberNavBackStack

@Serializable
object HomeRoute : NavDestination

@Serializable
data class DetailRoute(val itemId: String) : NavDestination

@Composable
fun MyApp() {
    // 返回栈本身就是一个 State
    val backStack = rememberNavBackStack(initial = HomeRoute)
    
    BackHandler(enabled = backStack.size > 1) {
        backStack.removeLastOrNull()
    }
    
    NavDisplay(
        backStack = backStack,
        entryDecorators = listOf(
            rememberSceneSetupNavEntryDecorator(),
            rememberSavedStateNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator(),
        ),
        transitionSpec = {
            slideInHorizontally { it } + fadeIn() togetherWith
            slideOutHorizontally { -it / 2 } + fadeOut()
        },
        entryProvider = entryProvider {
            entry<HomeRoute> { HomeScreen(...) }
            entry<DetailRoute> { key -> 
                DetailScreen(itemId = key.itemId) 
            }
        }
    )
}
```

### rememberNavBackStack 的关键参数

| 参数 | 作用 |
|------|------|
| `initial` | 初始目的地（必须是 `NavDestination` 类型） |
| `navContainer` | （可选）用于保存状态和提供 `SavedStateHandle` 的容器 |
| 返回值 | `SnapshotStateList<NavDestination>`，即返回栈本身 |

### 列表操作替代命令式 API

```kotlin
// 新建：backStack.add()
backStack.add(DetailRoute(itemId = "42"))

// 返回：backStack.removeLastOrNull()
backStack.removeLastOrNull()

// 清空栈：backStack.clear()
backStack.clear()

// 替换最后一项：backStack[lastIndex] = newRoute
backStack[backStack.lastIndex] = HomeRoute

// 批量操作
backStack.removeLastOrNull()
backStack.add(CartRoute)
```

**注意**：所有操作都是对 `SnapshotStateList` 的标准列表操作，Compose 自动追踪变化并触发重组。这是真正的单真相源。

## BackHandler —— 处理系统返回键

在声明式模式下，系统返回键的处理也需要相应调整：

```kotlin
@Composable
fun MyApp() {
    val backStack = rememberNavBackStack(initial = HomeRoute)
    
    // 系统返回键处理
    BackHandler(enabled = backStack.size > 1) {
        // 可以在返回前做业务判断
        when (val last = backStack.lastOrNull()) {
            is OrderConfirmationRoute -> {
                // 下单确认页：返回时清空到首页
                backStack.clear()
                backStack.add(HomeRoute)
            }
            else -> backStack.removeLastOrNull()
        }
    }
    
    NavDisplay(backStack = backStack, ...) { /* ... */ }
}
```

## entryProvider —— 定义路由与对应 UI

`entryProvider` DSL 是 `composable()` DSL 的升级版，专为 `NavDisplay` 设计：

```kotlin
entryProvider {
    // object 类型路由（无参数）
    entry<HomeRoute> {
        HomeScreen(
            onItemClick = { id -> backStack.add(DetailRoute(itemId = id)) },
            onCartClick = { backStack.add(CartRoute) }
        )
    }
    
    // data class 类型路由（带参数）
    entry<DetailRoute> { key ->
        DetailScreen(
            itemId = key.itemId,
            onAddToCart = { backStack.add(CartRoute) },
            onOrder = { cartId -> backStack.add(CheckoutRoute(cartId = cartId)) }
        )
    }
    
    entry<CartRoute> {
        CartScreen(
            onCheckout = { backStack.add(CheckoutRoute(cartId = generateCartId())) }
        )
    }
    
    entry<CheckoutRoute> { key ->
        CheckoutScreen(
            cartId = key.cartId,
            onOrderComplete = {
                // 跳过后退历史，直接到成功页
                backStack.removeLastOrNull() // 移除 Checkout
                backStack.add(OrderSuccessRoute)
            }
        )
    }
    
    entry<OrderSuccessRoute> {
        OrderSuccessScreen(
            onContinueShopping = {
                backStack.clear()
                backStack.add(HomeRoute)
            }
        )
    }
}
```

### entryProvider vs composable()

| 维度 | composable() | entryProvider + entry() |
|------|-------------|------------------------|
| 适用组件 | NavHost | NavDisplay（推荐）/ NavHost |
| 参数获取 | `backStackEntry.toRoute<T>()` | `key` 直接可用 |
| 导航操作 | navController.navigate() | backStack.add/remove |
| 返回值 | NavBackStackEntry | NavDestination（NavKey） |
| 适用场景 | 传统单窗格导航 | 声明式 + 多窗格 Scenes |

## entryDecorators —— 导航装饰器

`entryDecorators` 提供可插拔的导航行为扩展：

```kotlin
NavDisplay(
    backStack = backStack,
    entryDecorators = listOf(
        // 场景设置：管理多窗格布局
        rememberSceneSetupNavEntryDecorator(),
        // 状态保存：进程死亡后恢复导航状态
        rememberSavedStateNavEntryDecorator(),
        // ViewModel 存储：为每个目的地创建 ViewModelStore
        rememberViewModelStoreNavEntryDecorator(),
    ),
    // ...
)
```

**三个核心装饰器：**

| 装饰器 | 作用 |
|--------|------|
| `rememberSceneSetupNavEntryDecorator()` | 启用 Scenes API 多窗格布局支持 |
| `rememberSavedStateNavEntryDecorator()` | 自动保存返回栈状态到 SavedStateHandle |
| `rememberViewModelStoreNavEntryDecorator()` | 每个 NavDestination 独立的 ViewModelStore |

**使用建议**：这三个装饰器是 Nav3 多窗格推荐的默认组合。`rememberSceneSetupNavEntryDecorator()` 是多窗格布局的前提条件。

## Scenes API —— 原生多窗格布局

`rememberSceneSetupNavEntryDecorator()` 启用的 Scenes API 是 Nav3 最重要的新能力之一。它让 List-Detail 双窗格布局从"自行拼接"变成"框架原生支持"。

### ListDetailPaneScaffold + Nav3 集成

```kotlin
@OptIn(ExperimentalMaterial3AdaptiveApi::class)
@Composable
fun AdaptiveApp() {
    val backStack = rememberNavBackStack(initial = HomeRoute)
    
    ListDetailPaneScaffold(
        backStack = backStack,  // Nav3 返回栈直接作为 Scaffold 的返回栈
        listPane = {
            ListScreen(
                items = items,
                onItemClick = { id -> backStack.add(DetailRoute(itemId = id)) }
            )
        },
        detailPane = {
            // detailPane 由 NavDisplay 自动渲染
        },
        directive = rememberListDetailPaneScaffoldDirective(
            computeSimilarPaneAnchor = { _, _, _ -> /* 自定义窗格切换逻辑 */ }
        ),
        alignment = PaneExpansionStateRememberizer
    )
}
```

实际上，`ListDetailPaneScaffold` 内部使用 `rememberSceneSetupNavEntryDecorator()` 来实现窗格切换。开发者只需要：

1. 在 `entryDecorators` 中添加 `rememberSceneSetupNavEntryDecorator()`
2. 使用 `ListDetailPaneScaffold` 或 `ThreePaneScaffold`
3. 返回栈操作方式不变（`backStack.add()` / `backStack.removeLastOrNull()`）

框架自动在单窗格（手机）和多窗格（平板/桌面）之间切换，无需额外逻辑。

## NavHost 兼容模式：composable() 仍然可用

Nav3 的 `NavHost` 仍然支持 `composable()` DSL，这意味着从 Nav2 迁移时**不需要立即重写所有代码**：

```kotlin
// 迁移路径 1：保持 composable()，未来再迁移
NavHost(navController, startDestination = HomeRoute) {
    composable<HomeRoute> { HomeScreen(...) }
    composable<DetailRoute> { backStackEntry ->
        val route = backStackEntry.toRoute<DetailRoute>()
        DetailScreen(itemId = route.itemId)
    }
}
```

**迁移建议**：
- 新功能使用 `entryProvider` + `rememberNavBackStack`
- 存量功能保持 `composable()` + `navController.navigate()`
- 统一迁移时，用 `rememberNavBackStack` 替换 `rememberNavController()`

## 从 Nav2 到 Nav3 的迁移路径

### 步骤 1：更新依赖

```kotlin
// build.gradle.kts
dependencies {
    implementation("androidx.navigation:navigation-compose:3.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:2.0.0")
}
```

### 步骤 2：路由对象实现 NavDestination

```kotlin
// Nav2
@Composable
fun navigateToDetail(itemId: String) {
    navController.navigate("detail/$itemId")
}

// Nav3
@Serializable
data class DetailRoute(val itemId: String) : NavDestination

@Composable
fun navigateToDetail(itemId: String) {
    backStack.add(DetailRoute(itemId = itemId))
}
```

### 步骤 3：将 NavController 替换为 rememberNavBackStack

```kotlin
// Nav2
val navController = rememberNavController()

// Nav3
val backStack = rememberNavBackStack(initial = HomeRoute)
```

### 步骤 4：将 navigate() 替换为 add()

```kotlin
// Nav2
navController.navigate("detail/$itemId")
navController.popBackStack()
navController.popBackStack("home", inclusive = false)

// Nav3
backStack.add(DetailRoute(itemId = itemId))
backStack.removeLastOrNull()
backStack.clear()
backStack.add(HomeRoute)  // 带 inclusive 语义的重实现
```

### 步骤 5：在 BackHandler 中处理系统返回

```kotlin
// Nav2：默认处理
// 无需额外代码，NavController 自动处理系统返回

// Nav3：需要显式处理
BackHandler(enabled = backStack.size > 1) {
    backStack.removeLastOrNull()
}
```

## 常见误区

- **混淆 `backStack.add()` 和 `navController.navigate()`**：`add()` 是列表操作，不需要 `inclusive` 参数；如果需要 pop 并跳转，用 `removeLastOrNull()` + `add()` 组合
- **忘记 `BackHandler`**：`rememberNavBackStack` 不自动处理系统返回键，必须配合 `BackHandler` 使用
- **decorator 遗漏**：`rememberSceneSetupNavEntryDecorator()` 是多窗格的必要条件，漏加会导致 ListDetailPaneScaffold 回退到单窗格
- **混用模式**：同一个返回栈不要同时使用 `backStack.add()` 和 `navController.navigate()`，会导致状态不一致

## 最佳实践

1. **新项目直接用 Nav3**：`rememberNavBackStack` + `entryProvider` 是 Nav3 的推荐组合
2. **系统返回键优先处理**：在 `BackHandler` 中先做业务判断（如"下单页返回时清空到首页"），再执行 `removeLastOrNull()`
3. **多窗格场景启用 Scenes**：`ListDetailPaneScaffold` 配合 `rememberSceneSetupNavEntryDecorator()` 是平板/桌面应用的最佳实践
4. **SavedState 装饰器常开**：`rememberSavedStateNavEntryDecorator()` 确保进程死亡后导航状态正确恢复
5. **ViewModel 装饰器按需启用**：如果不需要跨目的地共享 ViewModel，可以不启用 `rememberViewModelStoreNavEntryDecorator()`

## 关联主题

- [Navigation Compose 3.0](./navigation.md) — 基础导航与类型安全路由
- [Navigation Compose 进阶技巧](./nav-advanced.md) — NavKey、visibleBackStack、模块化导航子图
- [Material 3 自适应布局](./material3.md) — ListDetailPaneScaffold 与 Predictive Back
