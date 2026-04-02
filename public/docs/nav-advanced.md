# Navigation Compose 进阶技巧 🧭✨

> 摘要：深入解析 Navigation 3 的 NavKey 接口机制、可见返回栈 API、跨目的地共享 ViewModel，以及复杂导航图的模块化设计思路。
>
> 适用版本：Navigation Compose 3.0+ / Kotlin 2.0+ / Kotlin Serialization 1.9+
>
> 更新时间：2026-04-02
>
> 标签：导航，类型安全，NavKey，visibleBackStack，共享ViewModel，Navigation 3

## 核心概念

Navigation 3 的类型安全路由不仅仅是一层语法糖——它背后是一套由 `NavKey` 接口、`toRoute<T>()` 解析和 NavGraph 泛型化共同支撑的体系。掌握这套体系，才能理解为什么 Navigation 3 能在编译期消除大量字符串路由的运行时错误，以及如何在大型应用中用可见返回栈实现更精确的导航控制。

## NavKey 接口机制

`NavKey` 是 Navigation 3 的核心标记接口。任何类型（类或 object）只要实现了 `NavKey`，就可以作为导航目的地（Destination）。`@Serializable` 注解是配合工具，NavKey 才是 Navigation 3 认识你的类型的真正接口。

```kotlin
// 路由对象的两种合法形式

// 1. data class：带参数的目的地
@Serializable
data class DetailRoute(
    val itemId: String,
    val highlightSection: String? = null
) : NavKey

// 2. object：无参数的单例目的地
@Serializable
object HomeRoute : NavKey

@Serializable
object SettingsRoute : NavKey
```

**NavKey 的内部工作原理：**

```
navController.navigate(DetailRoute(itemId = "42"))
         ↓
NavKey 序列化 → Bundle（路径 + 参数）
         ↓
NavGraph 匹配 → DetailRoute 的 composable<DetailRoute>
         ↓
backStackEntry.toRoute<DetailRoute>() → DetailRoute 实例
```

Navigation 运行时内部使用 `NavKeyValueParser` 将 `NavKey` 实例转化为可存储在返回栈中的 Bundle 形式。`toRoute<T>()` 做的是逆过程：从 Bundle 反序列化回类型对象。

**为什么比字符串路由更安全：**

| 维度 | 字符串路由 | NavKey 路由 |
|------|-----------|------------|
| 参数名拼写错误 | 运行时才发现 | 编译期报错 |
| 参数类型不匹配 | 运行时才发现 | 编译期报错 |
| 缺失必填参数 | 运行时才发现 | 编译期报错（data class 默认值可作为备选）|
| 路由不存在 | 运行时才发现 | 编译期报错 |

## visibleBackStack —— 精确控制返回行为

Navigation 3 新增了 `navController.visibleBackStack` 属性（`State<List<NavBackStackEntry<NavKey>>>`），它返回当前对用户可见的返回栈片段。与 `currentBackStackEntry` 不同，`visibleBackStack` 可以精确反映跨多级返回操作的栈顶状态。

**典型使用场景：**

```kotlin
@Composable
fun NavigationStateObserver() {
    val visibleBackStack by navController.visibleBackStack.collectAsState()

    // 监听可见返回栈变化，用于：
    // 1. 动态隐藏/显示 BottomBar
    val showBottomBar = visibleBackStack.any {
        it.destination.route != "fullscreen_modal"
    }

    // 2. 精确判断"用户在列表页"而非"返回栈有列表页"
    val isOnListScreen = visibleBackStack.lastOrNull() is NavDestination<HomeRoute>
}
```

**visibleBackStack vs currentBackStackEntry：**

```kotlin
// currentBackStackEntry：当前正在处理的返回栈顶部
val current = navController.currentBackStackEntryAsState()

// visibleBackStack：对用户真正可见的返回栈（可能跨多步返回操作）
val visible = navController.visibleBackStack.collectAsState()

// 场景区分：
// - currentBackStackEntry：用于"当前页面"的上下文操作
// - visibleBackStack：用于"导航状态"相关的 UI 条件判断（如 BottomBar 显示逻辑）
```

## 跨目的地共享 ViewModel

Navigation 3 支持通过 `navController.viewModelStoreOwner` 让多个目的地共享同一个 ViewModel，这对于"列表→详情"等需要预取数据的场景非常有用。

**使用方式：**

```kotlin
// 在父级 NavHost 作用域创建 ViewModel
// 所有子目的地共享同一个实例
val sharedViewModel: ListDetailViewModel = navController.viewModelStoreOwner
    .let { viewModelStoreOwner ->
        viewModel {
            ListDetailViewModel(
                repository = it.get(),
                itemId = savedStateHandle.get<String>("initialItemId") ?: ""
            )
        }
    }
```

**常见场景：**

```kotlin
// 场景：列表页和详情页共享数据
NavHost(navController, startDestination = ListRoute) {
    composable<ListRoute> { backStackEntry ->
        val parent = backStackEntry.promoteWithoutSaving()
        val viewModel = viewModel(parent.viewModelStoreOwner)

        ListScreen(
            items = viewModel.items,
            onItemClick = { id ->
                navController.navigate(DetailRoute(itemId = id))
            }
        )
    }

    composable<DetailRoute> { backStackEntry ->
        val parent = backStackEntry.promoteWithoutSaving()
        val viewModel = viewModel(parent.viewModelStoreOwner)

        DetailScreen(
            item = viewModel.getItem(backStackEntry.toRoute<DetailRoute>().itemId)
        )
    }
}
```

## 深层链接与参数校验

Navigation 3 的深层链接配合 `NavKey` 可以实现端到端类型安全：

```kotlin
@Serializable
data class ProductDetailRoute(
    val productId: String,
    val campaign: String? = null  // 可选 query 参数
) : NavKey

composable<ProductDetailRoute>(
    deepLinks = listOf(
        // 匹配 myapp://product/123
        navDeepLink<ProductDetailRoute>(
            uriPattern = "myapp://product/{productId}"
        ),
        // 匹配 https://myshop.com/p/123?campaign=summer
        navDeepLink<ProductDetailRoute>(
            uriPattern = "https://myshop.com/p/{productId}"
        )
    )
) { backStackEntry ->
    val route = backStackEntry.toRoute<ProductDetailRoute>()
    // route.productId 和 route.campaign 已经是解析好的类型
    ProductDetailScreen(
        productId = route.productId,
        campaign = route.campaign
    )
}
```

**参数校验——在导航图层级做：**

```kotlin
composable<ProductDetailRoute>(
    deepLinks = listOf(
        navDeepLink<ProductDetailRoute>(
            uriPattern = "https://myshop.com/p/{productId}"
        )
    )
) { backStackEntry ->
    val route = backStackEntry.toRoute<ProductDetailRoute>()

    // 类型安全，但 productId 格式仍需校验
    LaunchedEffect(route.productId) {
        if (!isValidProductId(route.productId)) {
            // 导航到错误页，而不是崩溃
            navController.navigate(ErrorRoute("invalid_product"))
        }
    }

    ProductDetailScreen(productId = route.productId)
}
```

## 导航图的模块化拆分

大型应用不应该把所有路由塞进一个巨大的 `NavHost`。推荐按功能模块拆分：

```kotlin
// AppNavHost.kt
@Composable
fun AppNavHost(navController: NavController<NavKey>) {
    NavHost(navController, startDestination = HomeRoute) {
        homeGraph(navController)      // 首页相关子图
        shopGraph(navController)      // 商店相关子图
        profileGraph(navController)   // 个人中心相关子图
    }
}

// HomeNavGraph.kt
fun NavGraphBuilder.homeGraph(navController: NavController<NavKey>) {
    composable<HomeRoute> { HomeScreen(...) }
    composable<HomeNotificationsRoute> { NotificationsScreen(...) }
}

// ShopNavGraph.kt
fun NavGraphBuilder.shopGraph(navController: NavController<NavKey>) {
    composable<ShopRoute> { ShopScreen(...) }
    composable<ProductDetailRoute> { ProductDetailScreen(...) }
    composable<CartRoute> { CartScreen(...) }
}
```

**模块化好处：**
- 团队并行开发不同模块，不互相阻塞
- 模块级导航图可以独立测试
- 减少单文件行数，提升可维护性

## 常见误区

- 混淆 `currentBackStackEntry` 和 `visibleBackStack`——前者是当前处理帧，后者是用户可见栈
- 在 `composable` 内创建 ViewModel 而不是共享父级作用域——导致每次导航都重建
- 把所有路由写在一个巨大的 `NavHost` 里——随应用增长变成不可维护的字符串泥团
- 以为 `@Serializable` 自动让类型"安全"——NavKey 才是真正的编译期检查机制

## 最佳实践

- 对所有导航目的地使用 `NavKey`（data class 或 object），拒绝裸字符串路由
- 用 `visibleBackStack` 判断 BottomBar / AppBar 等全局导航 UI 的显示状态
- 跨页面共享数据时，通过 `viewModel(parent.viewModelStoreOwner)` 共享 ViewModel
- 按业务域拆分导航子图，避免单 NavHost 无限膨胀
- 深层链接落地页必须做参数校验，拒绝直接信任外部输入

## 关联主题

- [Navigation Compose 3.0](./navigation.md)
- [共用元素过渡动画](./shared-element.md)
- [Compose 测试最佳实践](./testing.md)
