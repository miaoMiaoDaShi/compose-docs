# Navigation Compose 3.0 🧭

> 摘要：这篇文档整理 Compose 导航的基本建图方式、参数传递思路和常见路由结构。
>
> 适用版本：Navigation Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：导航，路由，NavHost，参数传递

## 核心概念

Navigation Compose 负责在 Compose 应用中管理页面切换、返回栈和参数路由。它的核心是使用 `NavHost` 描述导航图，再通过 `NavController` 在不同路由之间跳转。

## 关键 API / 机制

- `rememberNavController()`：创建并记住导航控制器。
- `NavHost`：声明导航图的入口和路由集合。
- `composable(route)`：注册某个页面目的地。
- `navArgument()`：定义路由参数及其类型。

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
