---
title: Codex Skill：把一次性提示词变成可复用工作流
date: 2026-08-27 10:12:34
categories: AI工程
tags:
  - Codex
  - Agent
  - Skill
  - OpenAI
excerpt: 介绍 Codex Skill 的目录结构、触发方式、作用域与编写原则，并通过一个最小示例说明如何沉淀可复用的智能体工作流。
---

当我们反复要求智能体执行同一套流程时，继续复制一段越来越长的提示词并不是理想方案。更合适的做法，是把这套流程沉淀为 **Skill**。

根据 [OpenAI 官方文档](https://learn.chatgpt.com/docs/build-skills)，Skill 是一种面向 ChatGPT 和 Codex 的可复用工作流封装。它可以同时包含操作指令、参考资料、模板以及需要确定性执行的脚本，让智能体在遇到特定任务时采用一致的方法完成工作。

## Skill 解决什么问题

普通提示词只服务于当前对话，而 Skill 更像项目中的操作手册。它适合处理以下场景：

- 团队反复执行相同的代码审查、发布或故障排查流程。
- 任务依赖项目特有的目录、命名规则和验收标准。
- 流程需要调用脚本、模板或外部工具。
- 希望智能体根据任务描述自动选择正确的工作方式。

Skill 的价值不只是“保存提示词”，而是把经验转化为可以版本管理、复用和验证的工程资产。

## 最小目录结构

一个 Skill 本质上是一个目录，其中 `SKILL.md` 是唯一必需的文件：

```text
my-skill/
├── SKILL.md
├── scripts/       # 可选：确定性脚本
├── references/    # 可选：按需加载的参考资料
├── assets/        # 可选：模板、图片等资源
└── agents/
    └── openai.yaml # 可选：界面与依赖元数据
```

最小的 `SKILL.md` 如下：

```markdown
---
name: release-check
description: 在发布 Hexo 博客或检查发布失败时使用。
---

1. 安装锁文件指定的依赖。
2. 执行生产构建。
3. 检查生成页面与资源引用。
4. 只有全部检查通过后才允许发布。
```

其中 `description` 非常关键。它既要说明 Skill 能做什么，也要明确何时应该触发，避免范围过宽导致错误调用。

## 显式触发与隐式触发

Codex 可以通过两种方式使用 Skill：

1. **显式触发**：在提示词中直接通过 `$skill-name` 指定。
2. **隐式触发**：任务与 `description` 匹配时，由 Codex 自动选择。

Codex 会先看到 Skill 的名称、描述和位置，只有选中后才读取完整的 `SKILL.md`。这种渐进式披露机制避免把所有详细说明一次性塞入上下文，也使一个项目可以维护多套相互独立的工作流。

如果某个 Skill 涉及高风险操作，希望它只能被主动调用，可以在 `agents/openai.yaml` 中关闭隐式触发：

```yaml
policy:
  allow_implicit_invocation: false
```

## Skill 放在哪里

对于需要随仓库一起维护的工作流，可以放在：

```text
.agents/skills/<skill-name>/SKILL.md
```

个人跨项目复用的 Skill 可以放在用户级 `.agents/skills` 目录；系统和管理员也可以提供更高层级的 Skill。仓库级 Skill 能随代码一起评审和演进，因此更适合记录项目约束。

## 编写原则

一个可靠的 Skill 通常具备以下特点：

- **职责单一**：一个 Skill 聚焦一个明确任务。
- **边界清晰**：描述同时写明适用和不适用的场景。
- **步骤可验证**：每一步都有清楚的输入、输出或完成条件。
- **按需加载**：主流程保留在 `SKILL.md`，大段资料放入 `references/`。
- **脚本克制**：能用指令表达时优先使用指令，需要确定性或重复计算时再使用脚本。
- **持续测试**：用应该触发和不应该触发的提示词验证 `description`。

## Skill 与 Plugin 的关系

Skill 用于设计工作流本身。当工作流只服务于个人或单个仓库时，直接维护 Skill 即可。如果希望把多个 Skill、连接器和展示资源打包给其他人安装，则更适合发布为 Plugin。

可以把两者简单理解为：**Skill 定义怎么做，Plugin 负责怎么分发和集成。**

## 总结

Skill 让智能体协作从“每次重新解释”升级为“复用经过验证的流程”。从一个高频、边界明确的任务开始，先写出最小 `SKILL.md`，再根据真实使用情况增加参考资料或脚本，是最稳妥的实践路径。

进一步阅读：[Build skills - OpenAI Docs](https://learn.chatgpt.com/docs/build-skills) 与 [Agent Skills 开放规范](https://agentskills.io/specification)。
