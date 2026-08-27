---
title: Go 高质量编程实践
date: 2026-08-27 10:30:00
categories:
  - Golang
tags:
  - Go
  - 工程实践
  - 代码质量
excerpt: 从正确性、可读性、错误处理和并发安全几个方面总结 Go 项目的日常实践。
---

## 什么是高质量代码

高质量不是把代码写得复杂，而是让代码在需求变化和异常输入下仍然**正确、可靠、易读、易维护**。Go 的标准库和工具链已经提供了很好的基础，工程实践的重点是把这些工具用在日常开发中。

## 先保证正确，再考虑优化

先写清楚输入、输出和边界条件，再选择数据结构和算法。不要用“以后再处理”的方式忽略空值、超时、重复调用和并发访问。

```go
import (
    "fmt"
    "strconv"
)

func parsePort(raw string) (int, error) {
    port, err := strconv.Atoi(raw)
    if err != nil {
        return 0, fmt.Errorf("parse port %q: %w", raw, err)
    }
    if port < 1 || port > 65535 {
        return 0, fmt.Errorf("port out of range: %d", port)
    }
    return port, nil
}
```

通过提前返回处理错误，主流程会更加清晰。错误应当带上上下文，并使用 `%w` 保留原始错误，方便上层 `errors.Is` 或 `errors.As` 判断。

## 可读性与接口设计

- 使用有意义的名词和动词命名，避免 `data`、`obj` 这类无法表达意图的名称。
- 函数只做一件事，参数数量过多时可以引入配置结构体。
- 接口由使用方定义，优先定义小接口，例如只包含 `Read` 方法的接口。
- 公共类型和函数写清楚注释，注释解释“为什么”，而不是重复代码表面含义。
- 让零值尽可能可用，减少额外的初始化步骤。

## 并发安全

goroutine 很轻量，但并不意味着可以随意创建。明确 goroutine 的退出条件，使用 `context.Context` 传递取消信号；共享状态使用 channel 或互斥锁保护，并用竞态检测验证假设。

```bash
gofmt -w .
go vet ./...
go test ./...
go test -race ./...
```

## 发布前检查清单

1. 正常、异常和边界输入是否都有测试？
2. 错误是否被正确返回或记录？
3. 网络、文件和数据库操作是否设置了超时？
4. 并发代码是否通过了 `go test -race`？
5. `gofmt`、`go vet` 和测试是否全部通过？

把这些检查固化到 CI 中，比依赖个人记忆更可靠。高质量代码最终体现为稳定的行为和低廉的维护成本。
