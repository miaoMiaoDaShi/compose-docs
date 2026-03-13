# Navigation Compose 进阶技巧 🧭✨

> 摘要：这篇文档聚焦 Compose 导航中的类型安全路由、深层链接和低耦合导航设计。
>
> 适用版本：Navigation Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：导航，类型安全，深层链接，最佳实践

## 核心概念

当基础导航搭建完成后，实际项目更关心的是参数序列化、深层链接接入、以及页面间如何保持低耦合。进阶导航的重点不是“能跳转”，而是“跳转是否稳定、可维护、可扩展”。

## 关键 API / 机制

- 类型安全路由：通过可序列化对象减少字符串拼接错误。
- `toRoute()`：把返回栈参数解析为类型化对象。
- `navDeepLink()`：为页面注册深层链接入口。
- 导航回调：让页面通过事件而不是控制器本身触发跳转。

## 示例代码

```kotlin
@Serializable data class Profile(val id: String)

navController.navigate(Profile(id = "user1234"))

composable<Profile> { backStackEntry ->
    val profile = backStackEntry.toRoute<Profile>()
    ProfileScreen(userId = profile.id)
}
```

## 常见误区

- 在页面层直接依赖整个 `NavController`：会让 UI 组件与导航框架强耦合。
- 类型安全路由与手写字符串并存且没有统一规范：会提升维护成本。
- 接入深层链接后不验证参数完整性：容易出现落地页异常。

## 最佳实践

- 页面间跳转尽量通过导航回调完成。
- 对外部拉起场景优先设计深层链接和参数校验。
- 把进阶导航规则单独沉淀，避免基础文档越写越大。

## 关联主题

- [Navigation Compose 3.0](./navigation.md)
- [共用元素过渡动画](./shared-element.md)
- [Compose 测试最佳实践](./testing.md)
