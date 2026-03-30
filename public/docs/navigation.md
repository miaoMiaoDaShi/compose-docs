# Navigation Compose 3.0 🧭

> 摘要：这篇文档整理 Compose Navigation 3 的基本建图方式、参数传递思路和常见路由结构，以及跨平台支持情况。
>
> 适用版本：Navigation Compose 3.0+ / Compose Multiplatform 1.10.0（非 Android 平台支持）
>
> 更新时间：2026-03-31
>
> 标签：导航，路由，NavHost，参数传递，Navigation 3

## 核心概念

Navigation Compose 负责在 Compose 应用中管理页面切换、返回栈和参数路由。**Navigation 3** 引入了类型安全路由、统一的 NavHost API 和非 Android 平台的完整支持。

## 关键 API / 机制

- `rememberNavController()`：创建并记住导航控制器。
- `NavHost`：声明导航图的入口和路由集合（Android / iOS / Desktop / Web 行为一致）。
- `composable(route)`：注册某个页面目的地（字符串路由）。
- `navArgument()`：定义路由参数及其类型。
- **Navigation 3 新增**：`NavType` 序列化参数支持、类型安全路由 DSL、深层链接统一处理。

## Navigation 3 类型安全路由

Navigation 3 配合 Kotlin 序列化可以避免字符串路由的拼接错误：

```kotlin
// 定义路由参数（使用 @Serializable）
@Serializable
data class DetailArgs(val itemId: String, val from: String = "home")

// 导航时传递对象而非字符串
navController.navigate(DetailArgs(itemId = "123"))

// NavHost 中接收类型安全参数
composable<DetailArgs>(
    deepLinks = listOf(
        navDeepLink<DetailArgs>(pathPattern = "/detail/{itemId}")
    )
) { backStackEntry ->
    val args = backStackEntry.toRoute<DetailArgs>()
    DetailScreen(itemId = args.itemId, from = args.from)
}
```

## Navigation 3 非 Android 平台支持

> 适用于：Compose Multiplatform 1.10.0+ / Navigation Compose 3.0+

**从 Compose Multiplatform 1.10.0 起**，Navigation 3 正式支持 iOS、Desktop 和 Web 平台，与 Android 保持统一 API。

| 平台 | NavHost | 类型安全路由 | 深层链接 |
|------|---------|-------------|---------|
| Android | ✅ | ✅ | ✅ |
| iOS | ✅ | ✅ | ✅（URL Scheme） |
| Desktop | ✅ | ✅ | ✅（自定义 URL） |
| Web | ✅ | ✅ | ✅（HTTP URL） |

**iOS 深层链接示例：**

```kotlin
composable<DetailArgs>(
    deepLinks = listOf(
        navDeepLink<DetailArgs>(
            uriPattern = "myapp://detail/{itemId}"
        )
    )
)
```

**Web 深层链接配置（Desktop/Android）：**
```kotlin
composable<DetailArgs>(
    deepLinks = listOf(
        navDeepLink<DetailArgs>(
            uriPattern = "https://myapp.com/detail/{itemId}"
        )
    )
)
```

## 示例代码

```kotlin
@Composable
fun MyNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToDetail = { itemId ->
                    navController.navigate("detail/$itemId")
                }
            )
        }
        composable(
            route = "detail/{itemId}",
            arguments = listOf(
                navArgument("itemId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}
```

## 常见误区

- 在任意子组件中随意透传 `NavController`：会增加组件耦合。
- 用字符串硬编码复杂路由且缺少约束：后期容易出现参数拼接错误。
- 把所有页面都塞进一个巨大导航图：模块边界会越来越模糊。

## 最佳实践

- 让页面接收导航回调，而不是直接依赖 `NavController`。
- 对常用路由参数建立统一约定，减少手写字符串错误。
- 基础导航和进阶导航能力可拆开维护，避免单篇文档过大。

## 关联主题

- [Navigation Compose 进阶技巧](./nav-advanced.md)
- [共用元素过渡动画](./shared-element.md)
- [Material 3 自适应布局](./material3.md)
